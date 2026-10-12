import nextEnv from '@next/env';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {databaseClient} from '../db/client.mjs';
nextEnv.loadEnvConfig(process.cwd());
const db=databaseClient();
try {
  await db.execute('CREATE TABLE IF NOT EXISTS _speakeasy_migrations (name TEXT PRIMARY KEY, hash TEXT NOT NULL, applied_at INTEGER NOT NULL)');
  const journal=JSON.parse(await readFile(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
  let count=0;
  for(const entry of journal.entries) {
    const sql=await readFile(new URL(`../drizzle/${entry.tag}.sql`,import.meta.url),'utf8');
    const hash=createHash('sha256').update(sql.replace(/\r\n/g,'\n')).digest('hex');
    // Check under a write lock: concurrent builds cannot apply the same migration twice.
    const tx=await db.transaction('write');
    try {
      const existing=await tx.execute({sql:'SELECT hash FROM _speakeasy_migrations WHERE name=?',args:[entry.tag]});
      if(existing.rows.length) {
        if(existing.rows[0].hash!==hash)throw new Error(`Applied migration changed: ${entry.tag}`);
      } else {
        for(const statement of sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean))await tx.execute(statement);
        await tx.execute({sql:'INSERT INTO _speakeasy_migrations VALUES (?,?,?)',args:[entry.tag,hash,Date.now()]});
        count++;
      }
      await tx.commit();
    } catch(error) {await tx.rollback();throw error} finally {tx.close()}
  }
  console.log(`Database ready: ${count} migration(s) applied.`);
} finally {db.close()}
