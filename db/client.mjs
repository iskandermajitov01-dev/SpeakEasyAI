import {createClient} from '@libsql/client';
import {mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
let client;
export function databaseClient() {
  if (client) return client;
  const url=process.env.TURSO_DATABASE_URL?.trim() || (process.env.VERCEL ? '' : 'file:.data/speakeasy.db');
  if (!url) throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel.');
  if (process.env.VERCEL && !/^(libsql|https):\/\//.test(url)) throw new Error('Vercel requires a remote Turso database.');
  if (!url.startsWith('file:') && !process.env.TURSO_AUTH_TOKEN?.trim()) throw new Error('Set TURSO_AUTH_TOKEN for the remote database.');
  if (url.startsWith('file:')) mkdirSync(dirname(resolve(url.slice(5))),{recursive:true});
  client=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN?.trim()||undefined,intMode:'number'});
  return client;
}
