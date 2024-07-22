export function allowedCors(){
  return {
    origin: process.env.CORS_ORIGIN,            // Permitir qualquer origem
    methods: process.env.CORS_METHODS,          // Permitir qualquer método HTTP
    allowedHeaders: process.env.CORS_HEADERS,   // Permitir qualquer cabeçalho
  }
}