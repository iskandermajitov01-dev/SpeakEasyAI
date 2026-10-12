import {databaseClient} from './client.mjs';
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function getDb() {
  return drizzle(databaseClient(), { schema });
}
