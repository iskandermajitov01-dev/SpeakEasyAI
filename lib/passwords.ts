import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';

// OWASP scrypt profile: 32 MiB per derivation, p=3. Version parameters are fixed
// server-side so database contents cannot request unbounded memory or CPU.
const prefix='scrypt-v1';
function derive(password:string,salt:string):Promise<Buffer>{
 return new Promise((resolve,reject)=>scrypt(password,salt,64,{N:32768,r:8,p:3,maxmem:64*1024*1024},(error,key)=>error?reject(error):resolve(key)));
}
export async function hashPassword(password:string){
 const salt=randomBytes(16).toString('hex');
 return `${prefix}$${salt}$${(await derive(password,salt)).toString('hex')}`;
}
export async function verifyPassword(password:string,stored:string){
 const [version,salt,hash]=stored.split('$');
 if(version!==prefix||!salt||!/^[a-f0-9]{32}$/.test(salt)||!hash||!/^[a-f0-9]{128}$/.test(hash))return false;
 const actual=await derive(password,salt);
 return timingSafeEqual(actual,Buffer.from(hash,'hex'));
}
// Missing accounts still perform the same expensive derivation.
export const dummyPasswordHash=`${prefix}$${'0'.repeat(32)}$${'0'.repeat(128)}`;
export const validUsername=(value:string)=>/^[a-z0-9][a-z0-9_.-]{2,23}$/.test(value);
export const validPassword=(value:string)=>value.length>=12&&value.length<=128;
