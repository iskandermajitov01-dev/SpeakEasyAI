import {sameOrigin} from '@/lib/app-auth';
export const runtime = 'nodejs';
export const maxDuration = 60;
import { getAppUser } from '@/lib/app-auth';
import {aiConfig,aiFailure} from '@/lib/ai';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Forbidden'},{status:403});
 if(!await getAppUser())return Response.json({error:'Please sign in.'},{status:401});
 const {key,baseUrl,transcriptionModel,transcriptionFormat}=aiConfig();if(!key)return Response.json({error:'Speech recognition is not available yet.'},{status:503});
 if(Number(request.headers.get('content-length')||0)>4000000)return Response.json({error:'Recording too long.'},{status:413});
 try{const form=await request.formData();const file=form.get('file');if(!(file instanceof File)||file.size>3800000||file.size<200||!/^audio\/(webm|mp4|ogg|wav|mpeg)/.test(file.type))return Response.json({error:'Could not read the recording. Please retry.'},{status:400});
 const input=new FormData();input.set('file',file,file.name);input.set('model',transcriptionModel);input.set('response_format',transcriptionFormat);input.set('temperature','0');
 const r=await fetch(`${baseUrl}/audio/transcriptions`,{method:'POST',headers:{Authorization:`Bearer ${key}`},body:input,signal:AbortSignal.timeout(30000)});
 if(!r.ok)return aiFailure(r,'Speech recognition');
 const result:any=await r.json();const text=typeof result.text==='string'?result.text.trim():'';const segments=result.segments||[];
 const silence=segments.length&&segments.every((s:any)=>s.no_speech_prob>.75);return Response.json({text:silence?'':text.slice(0,2000)},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Could not send audio. Check your connection.'},{status:502})}
}
