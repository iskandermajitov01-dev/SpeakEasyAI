import { env } from 'cloudflare:workers';
export function groqConfig(){return {key:env.GROQ_API_KEY?.trim() || '',model:env.GROQ_MODEL?.trim() || 'qwen/qwen3.8-27b'}}
export const levelGuides:Record<string,string>={
 A1:'Use very common words, present simple, one short question at a time. Maximum 20 words. Help with a short example when the learner struggles.',
 A2:'Use everyday vocabulary and simple past/future. Maximum 35 words. Ask one concrete question.',
 B1:'Use natural everyday English, occasional new vocabulary, reasons and experiences. Maximum 55 words.',
 B2:'Use natural conversational English, some idioms and nuanced questions. Maximum 75 words. Invite opinions and follow-up arguments.',
 C1:'Use fluent nuanced English, idiomatic expressions and thoughtful disagreement. Maximum 90 words. Challenge ideas respectfully.'
};
