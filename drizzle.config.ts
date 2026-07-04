import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Drizzle Kit roda fora do Next.js; carrega o env manualmente.
config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL ausente. Configure o .env.local')
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
})
