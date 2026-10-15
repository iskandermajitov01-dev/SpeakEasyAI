import {sameOrigin} from '@/lib/app-auth';
export const runtime = 'nodejs';
export const maxDuration = 60;
import { getAppUser } from '@/lib/app-auth';
import {aiConfig,aiFailure} from '@/lib/ai';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Forbidden'},{status:403});
 if(!await getAppUser())return Response.json({error:'Please sign in.'},{status:401});
 const {key,baseUrl,provider,speechModel,voice}=aiConfig();if(!key)return Response.json({error:'Voice is not available yet.'},{status:503});
 try{const raw=await request.text();if(raw.length>5000)return Response.json({error:'Text too long.'},{status:413});const {text}=JSON.parse(raw);if(typeof text!=='string'||!text.trim()||text.length>1200)return Response.json({error:'Invalid text.'},{status:400});
 const r=await fetch(`${baseUrl}/audio/speech`,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:speechModel,voice,input:text,response_format:provider==='OpenAI'?'mp3':'wav',...(provider==='OpenAI'&&speechModel.startsWith('gpt-4o-mini-tts')?{instructions:'Speak warmly and naturally, like a friendly English conversation partner. Use clear pronunciation, gentle expressiveness and relaxed pacing. Avoid an announcer voice.'}:{})}),signal:AbortSignal.timeout(55000)});
 if(!r.ok)return aiFailure(r,'Voice');
 // Complete the download before responding: a provider timeout must not send a truncated audio stream.
 const audio=await r.arrayBuffer();
 return new Response(audio,{headers:{'Content-Type':provider==='OpenAI'?'audio/mpeg':'audio/wav','Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Voice is temporarily unavailable. You can read the reply above.'},{status:502})}
}
