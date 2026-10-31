import { randomBytes } from 'node:crypto'
import { config } from 'dotenv'
import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Seed opcional. Rode com: pnpm db:seed
config({ path: '.env.local', quiet: true })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL ausente')

// O seed cria um admin. Rodá-lo contra o banco de produção daria uma conta
// privilegiada a quem tivesse acesso a este terminal ou ao log dele.
if (
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production'
) {
  throw new Error('Seed recusado: ambiente de produção.')
}

const db = drizzle(neon(databaseUrl), { schema })

async function main() {
  console.log('🌱 Semeando banco...')

  // Senha aleatória a cada execução, nunca fixa no código: este repositório é
  // público, e uma senha conhecida viraria credencial de admin em qualquer
  // banco onde o seed rodasse por engano.
  const password = randomBytes(12).toString('base64url')
  const passwordHash = await bcrypt.hash(password, 12)
  const [user] = await db
    .insert(schema.users)
    .values({
      name: 'Usuário Demo',
      email: 'demo@example.com',
      passwordHash,
      role: 'user',
    })
    .onConflictDoNothing()
    .returning()

  // Admin de exemplo, para exercitar `requireRole`/`adminAction` localmente.
  const [admin] = await db
    .insert(schema.users)
    .values({
      name: 'Admin Demo',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
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

  // Conta que já existia mantém a senha da execução que a criou.
  const created = [user, admin].filter((row) => row !== undefined)
  if (created.length > 0) {
    console.log(`\n🔑 Senha das contas criadas agora: ${password}`)
    for (const row of created) console.log(`   ${row.email} (${row.role})`)
  } else {
    console.log('\nAs contas demo já existiam; a senha não mudou.')
  }
}

main().catch((err) => {
  console.error('❌ Falha no seed:', err)
  process.exit(1)
})
