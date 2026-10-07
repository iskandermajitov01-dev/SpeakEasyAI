import { getChatGPTUser } from '@/app/chatgpt-auth';
import { storage } from '@/db/storage';
export async function GET(){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Войдите в аккаунт'},{status:401});
 try{const row=await storage().prepare('SELECT payload FROM learning_profiles WHERE user_id = ?').bind(user.userId).first<{payload:string}>();return Response.json({profile:row?JSON.parse(row.payload):null},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Не удалось загрузить прогресс. Попробуйте позже.'},{status:503})}
}
export async function PUT(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Войдите в аккаунт'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});
 if(Number(request.headers.get('content-length')||0)>20000)return Response.json({error:'Too large'},{status:413});
 try{const raw=await request.text();if(raw.length>20000)return Response.json({error:'Too large'},{status:413});const p=JSON.parse(raw);const s=p.stats;
 if(!['A1','A2','B1','B2','C1'].includes(p.level)||!Array.isArray(p.interests)||p.interests.length>3||p.interests.some((v:unknown)=>typeof v!=='string'||v.length>30)||!s||!['xp','minutes','sessions'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<10000000)||!Array.isArray(s.saved)||s.saved.length>500||s.saved.some((v:unknown)=>typeof v!=='string'||!/^[a-z]{1,40}$/.test(v))||!Array.isArray(s.dates)||s.dates.length>5000||s.dates.some((v:unknown)=>typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)))return Response.json({error:'Invalid profile'},{status:400});
 const payload=JSON.stringify({stats:{xp:s.xp,minutes:s.minutes,sessions:s.sessions,saved:[...new Set(s.saved)],dates:[...new Set(s.dates)]},level:p.level,interests:p.interests});
 await storage().prepare('INSERT INTO learning_profiles (user_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at').bind(user.userId,payload,new Date().toISOString()).run();return Response.json({ok:true});
 }catch{return Response.json({error:'Не удалось сохранить прогресс. Повторите позже.'},{status:503})}
}
