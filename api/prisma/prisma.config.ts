import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Ahora 'process' será reconocido gracias a @types/node
    url: process.env.DATABASE_URL,
  },
});