import { config } from 'dotenv'
import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Seed opcional. Rode com: pnpm db:seed
config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL ausente')

const db = drizzle(neon(databaseUrl), { schema })

async function main() {
  console.log('🌱 Semeando banco...')

  // Usuário demo com senha "password123" (apenas para desenvolvimento).
  const passwordHash = await bcrypt.hash('password123', 12)
  const [user] = await db
    .insert(schema.users)
    .values({
      name: 'Usuário Demo',
      email: 'demo@example.com',
      passwordHash,
    })
    .onConflictDoNothing()
    .returning()

  if (user) {
    await db.insert(schema.tasks).values([
      { userId: user.id, title: 'Ler o README do projeto modelo' },
      { userId: user.id, title: 'Configurar variáveis de ambiente' },
      { userId: user.id, title: 'Rodar as migrações', completed: true },
    ])
  }

  console.log('✅ Seed concluído.')
}

main().catch((err) => {
  console.error('❌ Falha no seed:', err)
  process.exit(1)
})
