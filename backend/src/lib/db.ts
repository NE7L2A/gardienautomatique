import { Pool } from "pg";

declare global {
  var poolPg: Pool | undefined;
}

const pool =
  globalThis.poolPg ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalThis.poolPg = pool;

export interface LigneBd {
  [colonne: string]: unknown;
}

export async function requete<T extends LigneBd>(
  texte: string,
  parametres: unknown[] = []
): Promise<T[]> {
  const resultat = await pool.query(texte, parametres);
  return resultat.rows as T[];
}

export async function pingBd(): Promise<void> {
  await pool.query("SELECT 1");
}
