import assert from 'node:assert/strict';
import {aiConfig,aiFailure} from '../lib/ai.ts';
import {SpeechCache} from '../lib/speech-cache.ts';
const names=['AI_PROVIDER','OPENAI_API_KEY','OPENAI_MODEL','OPENAI_SPEECH_MODEL','OPENAI_VOICE','GROQ_API_KEY','GROQ_MODEL'];
const saved=Object.fromEntries(names.map(n=>[n,process.env[n]]));
try{
 for(const n of names)delete process.env[n];
 assert.equal(aiConfig().provider,'Groq');
 process.env.OPENAI_API_KEY='test-key';
 assert.equal(aiConfig().provider,'OpenAI');
 assert.equal(aiConfig().baseUrl,'https://api.openai.com/v1');
 assert.equal(aiConfig().transcriptionFormat,'json');
 assert.equal(aiConfig().speechModel,'tts-1');assert.equal(aiConfig().voice,'nova');
 process.env.OPENAI_SPEECH_MODEL='gpt-4o-mini-tts';assert.equal(aiConfig().voice,'coral');delete process.env.OPENAI_SPEECH_MODEL;
 process.env.AI_PROVIDER='groq';assert.equal(aiConfig().provider,'Groq');
 assert.equal(aiConfig().transcriptionFormat,'verbose_json');
 process.env.AI_PROVIDER='openai';
 for(const error of [{code:'credit_balance_exhausted'},{type:'insufficient_quota'},{code:'insufficient_quota'}]){
  const r=await aiFailure(Response.json({error:{...error,message:'private upstream detail'}},{status:429}));
  assert.equal(r.status,503);const body=await r.json();assert.equal(body.code,'api_billing_unavailable');assert(!JSON.stringify(body).includes('private upstream detail'));
 }
 const limited=await aiFailure(Response.json({error:{code:'rate_limit_exceeded'}},{status:429,headers:{'Retry-After':'8'}}));
 assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'8');
 const forbidden=await aiFailure(Response.json({error:{message:'private'}},{status:401}));assert.equal(forbidden.status,502);
 const cache=new SpeechCache(2,10);const audio=new Blob(['1234']);
 cache.set('first',audio);cache.set('second',audio);assert.equal(cache.get('first'),audio);
 cache.set('third',audio);assert.equal(cache.get('second'),undefined);assert.equal(cache.get('first'),audio);
 cache.set('huge',new Blob(['12345678901']));assert.equal(cache.get('huge'),undefined);
 cache.set('large',new Blob(['1234567']));assert.equal(cache.get('first'),undefined);assert.equal(cache.get('third'),undefined);
 cache.clear();assert.equal(cache.get('large'),undefined);
 console.log('PASS: provider selection, voice defaults, bounded private speech cache, billing vs rate limits, safe errors and retry headers.');
}finally{for(const [n,v]of Object.entries(saved))if(v===undefined)delete process.env[n];else process.env[n]=v}
