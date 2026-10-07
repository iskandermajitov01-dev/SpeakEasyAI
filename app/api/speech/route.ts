import { getChatGPTUser } from '@/app/chatgpt-auth';
import { groqConfig } from '@/lib/groq';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});
 if(!await getChatGPTUser())return Response.json({error:'Войдите в аккаунт.'},{status:401});
 const {key}=groqConfig();if(!key)return Response.json({error:'Голосовой сервис не настроен.'},{status:503});
 try{const raw=await request.text();if(raw.length>5000)return Response.json({error:'Слишком длинный текст.'},{status:413});const {text}=JSON.parse(raw);if(typeof text!=='string'||!text.trim()||text.length>1200)return Response.json({error:'Некорректный текст.'},{status:400});
 const r=await fetch('https://api.groq.com/openai/v1/audio/speech',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:'canopylabs/orpheus-v1-english',voice:'hannah',input:text,response_format:'wav'}),signal:AbortSignal.timeout(30000)});
 if(!r.ok){const details:any=await r.json();return Response.json({error:r.status===429?'Лимит естественного голоса Groq исчерпан. Попробуйте позже.':details.error?.code==='model_terms_required'?'Примите условия Orpheus в Groq Console → Playground → canopylabs/orpheus-v1-english.':'Не удалось получить голосовой ответ.'},{status:r.status===429?429:502});}
 return new Response(r.body,{headers:{'Content-Type':'audio/wav','Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Озвучивание временно недоступно. Ответ доступен в тексте.'},{status:502})}
}
