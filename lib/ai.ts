export function aiConfig(){
 const provider=process.env.AI_PROVIDER?.trim()||(process.env.OPENAI_API_KEY?.trim()?'openai':'groq');
 if(provider!=='openai'&&provider!=='groq')throw new Error('AI_PROVIDER must be openai or groq.');
 const openai=provider==='openai';
 return {
  provider:openai?'OpenAI':'Groq',
  key:(openai?process.env.OPENAI_API_KEY:process.env.GROQ_API_KEY)?.trim()||'',
  baseUrl:openai?'https://api.openai.com/v1':'https://api.groq.com/openai/v1',
  model:(openai?process.env.OPENAI_MODEL:process.env.GROQ_MODEL)?.trim()||(openai?'gpt-4.1-mini':'qwen/qwen3.8-27b'),
  speechModel:openai?(process.env.OPENAI_SPEECH_MODEL?.trim()||'tts-1'):'canopylabs/orpheus-v1-english',
  voice:openai?(process.env.OPENAI_VOICE?.trim()||(process.env.OPENAI_SPEECH_MODEL?.startsWith('gpt-4o-mini-tts')?'coral':'nova')):'hannah',
  transcriptionModel:openai?'gpt-4o-mini-transcribe':'whisper-large-v3-turbo',
  transcriptionFormat:openai?'json':'verbose_json'
 };
}

// Provider errors must never expose upstream messages, keys or request content.
export async function aiFailure(response:Response,service='AI'){
 let code='',type='';
 try{const data=await response.json();code=data.error?.code||'';type=data.error?.type||''}catch{}
 const provider=aiConfig().provider;
 const billing=provider==='OpenAI'&&(type==='insufficient_quota'||['insufficient_quota','credit_balance_exhausted'].includes(code));
 const status=billing?503:response.status===429?429:502;
 const error=billing?'OpenAI API credits are unavailable. Please contact the site owner to check API billing.':response.status===429?`${provider} temporarily reached its ${service.toLowerCase()} quota. Please try again later.`:response.status===401||response.status===403?`${service} connection needs attention. Please contact the site owner.`:code==='model_terms_required'?'Voice setup needs attention. Please contact the site owner.':`${service} is temporarily unavailable. Please retry.`;
 const retry=response.headers.get('retry-after');
 return Response.json({error,code:billing?'api_billing_unavailable':status===429?'provider_rate_limit':'provider_unavailable'},{status,headers:{'Cache-Control':'no-store',...(status===429&&retry&&/^\d+(\.\d+)?$/.test(retry)?{'Retry-After':retry}:{})}});
}
