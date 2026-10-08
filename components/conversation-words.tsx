'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,Plus,Volume2,Loader2,RotateCcw} from 'lucide-react';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {normalizeWord,seedWords,wordEntry,type WordEntry} from '@/lib/vocabulary';

const pending=new Map<string,Promise<WordEntry>>();
function lookup(word:string,context:string){
 const key=word+'|'+context;
 if(!pending.has(key)){
  const task=fetch('/api/vocabulary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({word,context:context.slice(0,1200)})}).then(async r=>{const d=await r.json() as {entry:WordEntry;error:string};if(!r.ok)throw Error(d.error);return d.entry}).catch(e=>{pending.delete(key);throw e});
  if(pending.size>=300)pending.delete(pending.keys().next().value!);pending.set(key,task);
 }
 return pending.get(key)!;
}
function Word({text,context,entry,saved,onSave,onPronounce}:{text:string;context:string;entry?:WordEntry;saved:boolean;onSave:(word:string,entry:WordEntry)=>void;onPronounce:(word:string)=>void}){
 const word=normalizeWord(text),[open,setOpen]=useState(false),[data,setData]=useState<WordEntry|undefined>(entry||wordEntry(seedWords,word)),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),pinned=useRef(false);
 const cancel=()=>{if(timer.current)clearTimeout(timer.current)};
 const enter=()=>{cancel();timer.current=setTimeout(()=>setOpen(true),400)};
 const leave=()=>{cancel();if(!pinned.current)timer.current=setTimeout(()=>setOpen(false),220)};
 useEffect(()=>()=>cancel(),[]);
 useEffect(()=>{if(!open||data)return;let alive=true;setError('');lookup(word,context).then(v=>{if(alive)setData(v)}).catch(e=>{if(alive)setError(e.message)});return()=>{alive=false}},[open,data,word,context,retry]);
 return <Popover open={open} onOpenChange={v=>{cancel();pinned.current=v;setOpen(v)}}><PopoverTrigger asChild><button type="button" className={`word ${saved?'word-saved':''}`} aria-label={`Meaning of ${text}`} onPointerEnter={e=>{if(e.pointerType==='mouse')enter()}} onPointerLeave={leave} onFocus={enter} onBlur={leave} onClick={e=>{e.preventDefault();cancel();pinned.current=true;setOpen(true)}}>{text}</button></PopoverTrigger><PopoverContent className="word-popover" side="top" sideOffset={9} collisionPadding={16} onOpenAutoFocus={e=>e.preventDefault()} onCloseAutoFocus={e=>e.preventDefault()} onPointerEnter={cancel} onPointerLeave={leave} onFocusCapture={cancel}>
  <div className="word-popover-heading"><strong>{word}</strong><button className="icon-button" aria-label={`Pronounce ${word}`} onClick={()=>onPronounce(word)}><Volume2 size={19}/></button></div>
  {data?<><span className="word-ipa">{data.ipa||'Pronunciation guide unavailable'}</span><p className="word-meaning">{data.ru}</p>{data.example&&<blockquote>{data.example}</blockquote>}<button className={`word-save ${saved?'is-saved':''}`} disabled={saved} onClick={()=>{pinned.current=true;onSave(word,data)}}>{saved?<Check size={17}/>:<Plus size={17}/>} {saved?'In your vocabulary':'Save to vocabulary'}</button></>:error?<div className="word-lookup-error" role="status"><p>{error}</p><button className="text-button" onClick={()=>setRetry(r=>r+1)}><RotateCcw size={15}/> Try again</button></div>:<div className="word-loading" role="status"><Loader2 size={18} className="animate-spin"/> Looking up the word…</div>}
 </PopoverContent></Popover>;
}
export function ConversationWords({text,saved,lexicon,onSave,onPronounce}:{text:string;saved:string[];lexicon:Record<string,WordEntry>;onSave:(word:string,entry:WordEntry)=>void;onPronounce:(word:string)=>void}){
 return <>{text.split(/([A-Za-z]+(?:['’][A-Za-z]+)*)/g).map((part,i)=>/^[A-Za-z]+(?:['’][A-Za-z]+)*$/.test(part)&&part.length<=40?<Word key={i} text={part} context={text} saved={saved.includes(normalizeWord(part))} entry={wordEntry(lexicon,normalizeWord(part))} onSave={onSave} onPronounce={onPronounce}/>:<span key={i}>{part}</span>)}</>;
}
