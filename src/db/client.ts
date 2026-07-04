import 'server-only'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { serverEnv } from '@/lib/env.server'
import * as schema from './schema'

/**
 * Cliente Drizzle sobre o driver HTTP serverless do Neon.
 * `server-only` garante que o acesso ao banco nunca vaze para o cliente (SEC-02).
 */
const sql = neon(serverEnv.DATABASE_URL)

export const db = drizzle(sql, { schema })

export type Database = typeof db
