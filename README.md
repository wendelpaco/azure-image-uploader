# Upload Image to Azure Blob Storage

## Descrição

Este projeto é uma aplicação Node.js que permite o upload de imagens para o Azure Blob Storage e retorna a URL da imagem carregada. A aplicação utiliza Express.js e Multer para manipulação de uploads de arquivos e o SDK do Azure Storage Blob para interagir com o Azure Blob Storage. Além disso, a aplicação configura um proxy para mascarar as URLs das imagens, fazendo com que pareçam estar sendo servidas pelo seu backend.

## Requisitos

- Node.js (v14 ou superior)
- Uma conta no Azure com um contêiner de Blob Storage configurado
- `npm` ou `yarn` para gerenciar dependências

## Instalação

1. Clone o repositório para sua máquina local:

   ```sh
   git clone https://github.com/wendelpaco/upload-image.git
   cd upload-image
