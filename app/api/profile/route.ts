import { getChatGPTUser } from '@/app/chatgpt-auth';
import { storage } from '@/db/storage';
import { wordPattern, type WordEntry, type WordProgress } from '@/lib/vocabulary';
export async function GET(){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Войдите в аккаунт'},{status:401});
 try{const row=await storage().prepare('SELECT payload FROM learning_profiles WHERE user_id = ?').bind(user.userId).first<{payload:string}>();return Response.json({profile:row?JSON.parse(row.payload):null},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Не удалось загрузить прогресс. Попробуйте позже.'},{status:503})}
}
export async function PUT(request:Request){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'Войдите в аккаунт'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});
 if(Number(request.headers.get('content-length')||0)>600000)return Response.json({error:'Too large'},{status:413});
 try{const raw=await request.text();if(raw.length>600000)return Response.json({error:'Too large'},{status:413});const p=JSON.parse(raw);const s=p.stats;
 if(!['A1','A2','B1','B2','C1'].includes(p.level)||!Array.isArray(p.interests)||p.interests.length>3||p.interests.some((v:unknown)=>typeof v!=='string'||v.length>30)||!s||!['xp','minutes','sessions'].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<10000000)||!Array.isArray(s.saved)||s.saved.length>500||s.saved.some((v:unknown)=>typeof v!=='string'||v.length>40||!wordPattern.test(v))||!Array.isArray(s.dates)||s.dates.length>5000||s.dates.some((v:unknown)=>typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v)))return Response.json({error:'Invalid profile'},{status:400});
 const lexicon:Record<string,WordEntry>={},study:Record<string,WordProgress>={};
 for(const collection of [s.lexicon??{},s.study??{}])if(!collection||typeof collection!=='object'||Array.isArray(collection)||Object.keys(collection).length>500)return Response.json({error:'Invalid vocabulary'},{status:400});
 for(const [word,value] of Object.entries(s.lexicon??{})){
  const entry=value as WordEntry;if(!s.saved.includes(word)||!entry||typeof entry.ru!=='string'||!entry.ru.trim()||entry.ru.length>160||typeof entry.ipa!=='string'||entry.ipa.length>120||(entry.example!==undefined&&(typeof entry.example!=='string'||entry.example.length>240)))return Response.json({error:'Invalid word'},{status:400});
  lexicon[word]={ru:entry.ru,ipa:entry.ipa,...(entry.example?{example:entry.example}:{})};
 }
 for(const [word,value] of Object.entries(s.study??{})){
  const progress=value as WordProgress;if(!s.saved.includes(word)||!progress||!['attempts','correct','streak'].every(k=>Number.isInteger((progress as any)[k])&&(progress as any)[k]>=0&&(progress as any)[k]<10000000)||progress.correct>progress.attempts||progress.streak>progress.correct)return Response.json({error:'Invalid study progress'},{status:400});
  study[word]={attempts:progress.attempts,correct:progress.correct,streak:progress.streak};
 }
 const games=s.games??0,bestCombo=s.bestCombo??0;if(![games,bestCombo].every(n=>Number.isInteger(n)&&n>=0&&n<10000000))return Response.json({error:'Invalid game progress'},{status:400});
 const practiceSeconds=s.practiceSeconds??s.minutes*60,dailyGoal=s.dailyGoal??5,dailySeconds=s.dailySeconds??{},history=s.history??[];
 if(!Number.isInteger(practiceSeconds)||practiceSeconds<0||practiceSeconds>600000000||![5,10,15].includes(dailyGoal)||!dailySeconds||typeof dailySeconds!=='object'||Array.isArray(dailySeconds)||Object.keys(dailySeconds).length>5000||Object.entries(dailySeconds).some(([day,time])=>!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isInteger(time)||Number(time)<0||Number(time)>86400)||!Array.isArray(history)||history.length>30||history.some((h:any)=>!h||typeof h.id!=='string'||h.id.length>50||typeof h.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(h.date)||typeof h.topic!=='string'||h.topic.length>100||!['A1','A2','B1','B2','C1'].includes(h.level)||!['seconds','turns','xp'].every(k=>Number.isInteger(h[k])&&h[k]>=0&&h[k]<10000000)))return Response.json({error:'Invalid practice progress'},{status:400});
 const payload=JSON.stringify({stats:{xp:s.xp,minutes:Math.floor(practiceSeconds/60),sessions:s.sessions,saved:[...new Set(s.saved)],dates:[...new Set(s.dates)],lexicon,study,games,bestCombo,practiceSeconds,dailyGoal,dailySeconds,history:history.map((h:any)=>({id:h.id,date:h.date,topic:h.topic,level:h.level,seconds:h.seconds,turns:h.turns,xp:h.xp}))},level:p.level,interests:p.interests});
 await storage().prepare('INSERT INTO learning_profiles (user_id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at').bind(user.userId,payload,new Date().toISOString()).run();return Response.json({ok:true});
 }catch{return Response.json({error:'Не удалось сохранить прогресс. Повторите позже.'},{status:503})}
}
