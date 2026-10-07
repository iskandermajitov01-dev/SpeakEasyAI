import { env } from 'cloudflare:workers';
export function storage(){if(!env.DB)throw Error('Storage unavailable');return env.DB}
