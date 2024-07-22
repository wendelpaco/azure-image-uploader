import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import axios from 'axios'
import multer from 'multer'
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob'
import { v4 as uuidv4 } from 'uuid'
import cors from 'cors'
import { allowedCors } from './config/cors'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors(allowedCors()))

const upload = multer({ storage: multer.memoryStorage() })

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY!
const containerName = process.env.AZURE_CONTAINER!
const blobServiceUrl = `https://${accountName}.blob.core.windows.net`

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
const blobServiceClient = new BlobServiceClient(
  blobServiceUrl,
  sharedKeyCredential
)

app.post('/upload-wiseshop', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let blobName: string
    const defaultPrefix = process.env.FOLDER_DEFAULT_PREFIX!

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    if (req.body.blobName) {
      blobName = req.body.blobName

      blobName = blobName.replace(/^wiseshop_images_/, '')

      if (!blobName.startsWith(defaultPrefix)) {
        blobName = `${defaultPrefix}${blobName}`
      }
    } else {
      blobName = `${defaultPrefix}${uuidv4()}${req.file.originalname.slice(req.file.originalname.lastIndexOf('.'))}`
    }

    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    const data = req.file.buffer

    const uploadBlobResponse = await blockBlobClient.upload(data, data.length, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype,
      },
    })

    res.json({
      url: `${req.protocol}://${req.get('host')}/${blobName}`,
      urlAzure: blockBlobClient.url,
      createdAt: uploadBlobResponse.date
    })
  } catch (error) {
    console.error('Error uploading blob:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/wiseshop/images/*', async (req: Request, res: Response) => {
  try {
    const blobName = req.params[0];
    const blobUrl = `${blobServiceUrl}/${containerName}/${process.env.FOLDER_DEFAULT_PREFIX}${blobName}`;

    const response = await axios.get(blobUrl, { responseType: 'arraybuffer' });

    res.setHeader('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {

    console.error('Error details:', error);

    if (axios.isAxiosError(error)) {
      console.error('Error Response Data:', error.response?.data);
      console.error('Error Response Status:', error.response?.status);
      console.error('Error Message:', error.message);
    } else {
      console.error('Unexpected Error:', error);
    }
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
