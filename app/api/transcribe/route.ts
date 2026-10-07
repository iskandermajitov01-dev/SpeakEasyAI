import { getChatGPTUser } from '@/app/chatgpt-auth';
import { groqConfig } from '@/lib/groq';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Forbidden'},{status:403});
 if(!await getChatGPTUser())return Response.json({error:'Войдите в аккаунт.'},{status:401});
 const {key}=groqConfig();if(!key)return Response.json({error:'Распознавание не настроено.'},{status:503});
 if(Number(request.headers.get('content-length')||0)>6000000)return Response.json({error:'Запись слишком длинная.'},{status:413});
 try{const form=await request.formData();const file=form.get('file');if(!(file instanceof File)||file.size>5000000||file.size<200||!/^audio\/(webm|mp4|ogg|wav|mpeg)/.test(file.type))return Response.json({error:'Не удалось прочитать запись. Попробуйте ещё раз.'},{status:400});
 const input=new FormData();input.set('file',file,file.name);input.set('model','whisper-large-v3-turbo');input.set('response_format','verbose_json');input.set('temperature','0');
 const r=await fetch('https://api.groq.com/openai/v1/audio/transcriptions',{method:'POST',headers:{Authorization:`Bearer ${key}`},body:input,signal:AbortSignal.timeout(30000)});
 if(!r.ok)return Response.json({error:r.status===429?'Лимит распознавания Groq исчерпан. Попробуйте позже.':'Не удалось распознать запись.'},{status:r.status===429?429:502});
 const result:any=await r.json();const text=typeof result.text==='string'?result.text.trim():'';const segments=result.segments||[];
 const silence=segments.length&&segments.every((s:any)=>s.no_speech_prob>.75);return Response.json({text:silence?'':text.slice(0,2000)},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Не удалось отправить голос. Проверьте соединение.'},{status:502})}
}
