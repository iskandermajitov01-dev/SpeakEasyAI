import { groqConfig } from '@/lib/groq';
export function GET(){const ai=!!groqConfig().key;return Response.json({ai,provider:ai?'Groq':null,mode:ai?'ai':'scripted-practice'},{headers:{'Cache-Control':'no-store'}})}
