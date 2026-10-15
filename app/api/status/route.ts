export const runtime = 'nodejs';
export const maxDuration = 60;
import {aiConfig} from '@/lib/ai';
export function GET(){const ai=!!aiConfig().key;return Response.json({ai,provider:ai?aiConfig().provider:null,mode:ai?'ai':'scripted-practice'},{headers:{'Cache-Control':'no-store'}})}
