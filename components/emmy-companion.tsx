'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowRight,Heart,Moon,Sparkles,Sun,X} from 'lucide-react';

export type EmmyMood='idle'|'wave'|'celebrate'|'think'|'blink'|'hug';
type EmmyEvent='correct'|'try-again'|'game-complete'|'level-up'|'purchase';
export function emmyReact(kind:EmmyEvent){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('speakeasy:emmy',{detail:kind}))}

export function EmmyCharacter({mood='idle',className=''}:{mood?:EmmyMood;className?:string}){
 return <span className={`emmy-character mood-${mood} ${className}`} aria-hidden="true"><span className="emmy-ground"/><span className="emmy-body"><span className={`emmy-sprite pose-${mood}`}/></span><span className="emmy-spark spark-one">✦</span><span className="emmy-spark spark-two">✧</span><span className="emmy-spark spark-three">♥</span></span>;
}

export function EmmyMoment({mood='hug',children}:{mood?:EmmyMood;children:ReactNode}){
 return <div className="emmy-moment"><EmmyCharacter mood={mood}/><p><b>Emmy says</b>{children}</p></div>;
}

const pageLines:Record<string,string[]>={
 home:["Hey, you. Ready for a little English?","Big confidence starts with a tiny hello.","You bring the stories. I’ll bring the encouragement."],
 topics:["A café, a new city, outer space… where next?","Pick something you love. The words will follow.","Curiosity looks good on you."],
 dictionary:["Words are little souvenirs from your conversations.","Collect a word. Play a round. Make it yours.","Let’s turn ‘I’ve seen it’ into ‘I know it’!"],
 progress:["Look at you, showing up for yourself!","Tiny steps still take you places.","Your pace. Your progress. I’m cheering for both."],
 shop:["A little reward? You’ve earned the choice.","Sparks are for a little extra personality.","Learning, but make it you."],
 settings:["Let’s find a rhythm that feels right.","Gentle or lively? Make yourself comfortable.","Your learning space deserves your personal touch."]
};
const touchLines=["That tickles! Okay, one more little word?","A tiny hug for a brave English speaker.","You + a little practice = good things.","Mistakes welcome. Curiosity encouraged.","My favourite word today? ‘Yet.’ As in: ‘I don’t know it yet.’","I’m small. Your possibilities aren’t."];
const reactionLines:Record<EmmyEvent,{mood:EmmyMood;lines:string[]}>={
 correct:{mood:'celebrate',lines:["That’s the one! Your words are clicking.","Nice match! A tiny victory dance for you.","Yes! One more word feeling like home."]},
 'try-again':{mood:'hug',lines:["Not quite — and that’s how we learn. Keep going.","A little oops is a useful clue. You’ve got this."]},
 'game-complete':{mood:'celebrate',lines:["Round complete! Look at those words getting familiar.","A little game. A little growth. A very happy Emmy."]},
 'level-up':{mood:'celebrate',lines:["A new chapter! I knew you had a little more in you.","New level unlocked. Same brave you."]},
 purchase:{mood:'hug',lines:["Ooh, a little personality upgrade!","That’s a lovely addition to your learning space."]}
};

export function EmmyCompanion({view,hidden,name,words,xp,onExplore}:{view:string;hidden:boolean;name:string;words:number;xp:number;onExplore:()=>void}){
 const [mood,setMood]=useState<EmmyMood>('wave'),[phrase,setPhrase]=useState("Hi, I’m Emmy. Your little English cheerleader."),[open,setOpen]=useState(false),[resting,setResting]=useState(false),[ready,setReady]=useState(false),[bounce,setBounce]=useState(0),[blink,setBlink]=useState(false);
 const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null),poseTimer=useRef<ReturnType<typeof setTimeout>|null>(null),touch=useRef(0),line=useRef(0),lastView=useRef(''),previous=useRef<{words:number;xp:number}|null>(null),first=useRef(true),restRef=useRef(resting),hiddenRef=useRef(hidden);
 restRef.current=resting;hiddenRef.current=hidden;
 function clearTimers(){if(closeTimer.current)clearTimeout(closeTimer.current);if(poseTimer.current)clearTimeout(poseTimer.current)}
 function show(text:string,pose:EmmyMood='wave',manual=false){if(hiddenRef.current||(!manual&&restRef.current))return;clearTimers();setPhrase(text);setMood(pose);setBounce(n=>n+1);setOpen(true);closeTimer.current=setTimeout(()=>setOpen(false),manual?11000:6000);poseTimer.current=setTimeout(()=>setMood('idle'),2200)}
 useEffect(()=>{try{const rest=localStorage.getItem('speakeasy-emmy-rest')==='1';setResting(rest);restRef.current=rest}catch{}setReady(true);return clearTimers},[]);
 useEffect(()=>{if(!ready||hidden)return;if(lastView.current===view)return;lastView.current=view;if(first.current){first.current=false;show(name==='Explorer'?"Hi, I’m Emmy. Your little English cheerleader.":`Hey, ${name}! A little English adventure?`,'wave');return}const lines=pageLines[view]||pageLines.home;show(lines[line.current++%lines.length],view==='progress'?'hug':view==='settings'?'think':'wave')},[view,ready,hidden]);
 useEffect(()=>{if(!ready||hidden){previous.current=null;return}const p=previous.current;previous.current={words,xp};if(!p)return;if(words>p.words)show("A new word! I’ll keep it warm in your collection.",'hug');else if(xp>p.xp)show("A little effort, a little progress. You did that!",'celebrate')},[words,xp,ready,hidden]);
 useEffect(()=>{const reaction=(e:Event)=>{const kind=(e as CustomEvent<EmmyEvent>).detail,entry=reactionLines[kind];if(entry)show(entry.lines[line.current++%entry.lines.length],entry.mood)};const focus=(e:FocusEvent)=>{const el=e.target as HTMLElement;if(el.matches('input,textarea,select')&&!el.closest('.emmy-companion'))setOpen(false)};window.addEventListener('speakeasy:emmy',reaction);document.addEventListener('focusin',focus);return()=>{window.removeEventListener('speakeasy:emmy',reaction);document.removeEventListener('focusin',focus)}},[]);
 useEffect(()=>{if(hidden){clearTimers();setOpen(false);setMood('idle')}},[hidden]);
 useEffect(()=>{if(!ready||resting||hidden||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;let timer:ReturnType<typeof setTimeout>;const interval=setInterval(()=>{if(document.hidden)return;setBlink(true);timer=setTimeout(()=>setBlink(false),180)},6200);return()=>{clearInterval(interval);clearTimeout(timer);setBlink(false)}},[ready,resting,hidden]);
 function rest(){const next=!resting;restRef.current=next;setResting(next);clearTimers();setOpen(false);setMood('idle');try{localStorage.setItem('speakeasy-emmy-rest',next?'1':'0')}catch{}if(!next)show("Back from my little nap. Hello again!",'wave',true)}
 if(!ready||hidden)return null;
 const displayed=resting?'blink':mood==='idle'&&blink?'blink':mood;
 return <aside className={`emmy-companion ${open?'is-open':''} ${resting?'is-resting':''}`} aria-label="Emmy, your learning companion"><div id="emmy-message" className="emmy-bubble" hidden={!open}><div className="emmy-bubble-heading"><span><Heart size={12}/> A LITTLE NOTE FROM EMMY</span><button aria-label="Close Emmy’s message" onClick={()=>setOpen(false)}><X size={15}/></button></div><p role="status" aria-live="polite" aria-atomic="true">{phrase}</p><div className="emmy-bubble-actions"><button className="emmy-explore" onClick={()=>{setOpen(false);onExplore()}}>{view==='dictionary'?'My word games':view==='topics'?'Pick a conversation':'Let’s practise'}<ArrowRight size={14}/></button><button className="emmy-rest" aria-label={resting?'Wake Emmy up':'Let Emmy rest'} onClick={rest}><Moon size={14}/></button></div></div><button className="emmy-pet-button" aria-label={resting?'Wake Emmy up':'Say hello to Emmy'} aria-expanded={open} aria-controls="emmy-message" onClick={()=>resting?rest():show(touchLines[touch.current++%touchLines.length],touch.current%3===0?'celebrate':touch.current%2===0?'hug':'wave',true)}><EmmyCharacter key={bounce} mood={displayed}/><span className="emmy-pet-name">Emmy {resting?<Moon size={10}/>:<Sparkles size={10}/>}</span></button><span className="emmy-tap-hint">{resting?'Taking a little nap':'Tap for a little cheer'}</span>{resting&&<button className="emmy-wake" onClick={rest}><Sun size={12}/>Wake up</button>}</aside>;
}
