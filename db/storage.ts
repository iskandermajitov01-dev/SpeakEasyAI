import type {InValue, ResultSet} from '@libsql/client';
import {databaseClient} from './client.mjs';
const result=(r:ResultSet)=>({results:r.rows,meta:{changes:r.rowsAffected}});
class Statement {
  constructor(readonly sql:string,readonly args:InValue[]=[]) {}
  bind(...args:InValue[]) {return new Statement(this.sql,args)}
  async first<T=Record<string,unknown>>():Promise<T|null> {
    const r=await databaseClient().execute(this);return (r.rows[0] as T|undefined)??null;
  }
  async all<T=Record<string,unknown>>() {
    const r=await databaseClient().execute(this);return {results:r.rows as T[]};
  }
  async run() {return result(await databaseClient().execute(this))}
}
const database={
  prepare(sql:string) {return new Statement(sql)},
  async batch(statements:Statement[]) {return (await databaseClient().batch(statements,'write')).map(result)}
};
export function storage() {return database}
