import {cookies} from 'next/headers';
import {createHash,randomBytes} from 'node:crypto';
import {storage} from '@/db/storage';

export const sessionCookie='speakeasy_session';
export type AppUser={userId:string;username:string;fullName:string};
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export async function getAppUser():Promise<AppUser|null>{
 const token=(await cookies()).get(sessionCookie)?.value;
 if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
 const row=await storage().prepare('SELECT a.user_id,a.username,p.display_name FROM app_auth_sessions s JOIN app_accounts a ON a.user_id=s.user_id LEFT JOIN academy_profiles p ON p.user_id=a.user_id WHERE s.token_hash=? AND s.expires>?').bind(digest(token),Date.now()).first<{user_id:string;username:string;display_name:string|null}>();
 return row?{userId:row.user_id,username:row.username,fullName:row.display_name||row.username}:null;
}
export function cookieValue(request:Request,token:string,seconds:number){
 const url=new URL(request.url),secure=url.protocol==='https:'||!['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 return `${sessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${secure?'; Secure':''}`;
}
export async function newSession(userId:string,remember:boolean){
 const token=randomBytes(32).toString('hex'),seconds=(remember?30:1)*86400;
 await storage().prepare('INSERT INTO app_auth_sessions (token_hash,user_id,expires) VALUES (?,?,?)').bind(digest(token),userId,Date.now()+seconds*1000).run();
 return {token,seconds};
}
export async function removeSession(){
 const token=(await cookies()).get(sessionCookie)?.value;
 if(token&&/^[a-f0-9]{64}$/.test(token))await storage().prepare('DELETE FROM app_auth_sessions WHERE token_hash=?').bind(digest(token)).run();
}
export function authJson(data:unknown,status=200,cookie?:string){
 return Response.json(data,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache',...(cookie?{'Set-Cookie':cookie}:{})}});
}
export function sameOrigin(request:Request){
 const url=new URL(request.url);
 // Next.js may normalize the internal hostname to localhost. Host is the public request authority.
 const host=request.headers.get('host')||url.host;
 return request.headers.get('origin')===url.protocol+'//'+host;
}
export async function consumeAttempt(key:string,limit:number,windowMs:number){
 const bucket=digest(key),now=Date.now();
 const row=await storage().prepare('INSERT INTO app_auth_attempts (bucket,attempts,expires) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN expires<=? THEN 1 ELSE attempts+1 END, expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING attempts,expires').bind(bucket,now+windowMs,now,now).first<{attempts:number;expires:number}>();
 return !!row&&row.attempts<=limit;
}
