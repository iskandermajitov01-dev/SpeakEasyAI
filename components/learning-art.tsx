import {EmmyCharacter} from './emmy-companion';
import {ArrowUpRight,Coins,Headphones,Sparkles} from 'lucide-react';

const scenes:Record<string,string>={Life:'life',Travel:'travel',Culture:'culture',Learning:'ideas',Ideas:'ideas',Work:'work',Roleplay:'cafe','Your topics':'ideas'};
const topicScenes:Record<string,string>={pets:'pets',fitness:'sport',books:'books',gaming:'gaming',world:'nature',city:'city',weekend:'nature',habits:'sport',friends:'gaming',airport:'travel',hotel:'city',directions:'city',shopping:'work',restaurant:'cafe',science:'ideas',traditions:'travel'};
export function TopicArt({category,id}:{category:string;id:string}){
 return <div className={`topic-art scene-${topicScenes[id]||scenes[category]||'ideas'}`} aria-hidden="true"><span className="topic-art-arrow"><ArrowUpRight size={20}/></span></div>;
}
export function PageArt({view,balance}:{view:string;balance?:number}){
 if(view==='home')return null;
 const content:Record<string,{eyebrow:string;title:string;text:string;art:string;scene?:string}>={
  topics:{eyebrow:'FOLLOW YOUR CURIOSITY',title:'Where will English take you?',text:'A little café. A new city. A big what-if. Pick a world and make it yours.',art:'topic',scene:'travel'},
  dictionary:{eyebrow:'COLLECT. PLAY. REMEMBER.',title:'Small words. Big possibilities.',text:'Turn the words you meet into words you use. Your next favourite game starts here.',art:'games'},
  progress:{eyebrow:'EVERY STEP IS A LITTLE WIN',title:'You’re building something good.',text:'A conversation, a new word, a little more courage. It all adds up.',art:'hero'},
  shop:{eyebrow:'A LITTLE REWARD FOR YOUR CURIOSITY',title:'More you, in every detail.',text:'Your effort earns Sparks. Find a new colour, a new companion, a new way to shine.',art:'games'},
  settings:{eyebrow:'MADE TO FEEL LIKE YOUR SPACE',title:'Find your happy rhythm.',text:'A gentler voice, a bigger goal, or a fresh start. Make learning fit your day.',art:'hero'}
 };
 const c=content[view];if(!c)return null;
 return <section className={`illustrated-banner banner-${view}`}><div><span className="eyebrow"><Sparkles size={14}/>{c.eyebrow}</span><h2>{c.title}</h2><p>{c.text}</p>{balance!==undefined&&<div className="banner-wallet"><Coins size={23}/><strong>{balance}</strong><span>Sparks available</span></div>}</div>{c.art==='topic'?<div className={`banner-art topic-art scene-${c.scene}`} aria-hidden="true"/>:<img className="banner-art" src={`/art/${c.art==='games'?'word-play':'emmy-world'}.webp`} alt="" width="600" height="400" loading="eager"/>}</section>;
}
export function HeroArt(){return <div className="hero-illustration" aria-hidden="true"><span className="hero-letter">Aa</span><span className="hero-letter letter-two">✦</span><span className="hero-letter letter-three">✧</span><EmmyCharacter mood="wave" className="hero-emmy"/><span className="illustration-sticker sticker-hello">Hello, possibility. <Sparkles size={16}/></span><span className="illustration-sticker sticker-voice"><Headphones size={16}/>Your voice belongs here.</span></div>}
