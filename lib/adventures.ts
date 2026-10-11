import type {Level} from './academy';
export const missions=[
 {id:'cafe',title:'Your first café order',topic:'food',level:'A1',icon:'☕',story:'A cosy café, one busy barista, and your perfect drink.',twist:'Your first choice is sold out. Choose an alternative.',goals:['Order a drink politely','Ask the price','Choose an alternative'],reward:30},
 {id:'hotel',title:'A room with a surprise',topic:'hotel',level:'A2',icon:'🧳',story:'You have arrived at your hotel after a long journey.',twist:'The room is too noisy. Ask for a solution.',goals:['Check in with a reservation','Ask about breakfast','Resolve a problem with the room'],reward:30},
 {id:'return',title:'The wrong size',topic:'shopping',level:'B1',icon:'🛍️',story:'Your new jacket does not fit. Can you sort it out?',twist:'The shop has no replacement in your size.',goals:['Explain the problem','Ask about an exchange','Agree on a refund or alternative'],reward:30},
 {id:'interview',title:'The opportunity',topic:'interview',level:'B2',icon:'💼',story:'A friendly interviewer wants to know what you can bring.',twist:'You are asked about a time something went wrong.',goals:['Introduce your relevant experience','Give a specific example','Ask a thoughtful question'],reward:30},
 {id:'debate',title:'A different perspective',topic:'debate',level:'C1',icon:'🌍',story:'Discuss whether technology makes us more connected.',twist:'Your partner challenges your strongest argument.',goals:['Present a nuanced argument','Respond to a counterargument','Find common ground'],reward:30}
] as const;
export type Mission=typeof missions[number];
export const roomItems=[
 {id:'room-plant',name:'Little green friend',icon:'🪴',price:40,slot:'plant',description:'A leafy companion for Emmy’s corner.'},
 {id:'room-books',name:'Story stack',icon:'📚',price:60,slot:'shelf',description:'A tiny library, full of possibilities.'},
 {id:'room-lamp',name:'Moonlight lamp',icon:'🌙',price:80,slot:'lamp',description:'A soft glow for evening adventures.'},
 {id:'room-stars',name:'Starlight wallpaper',icon:'✨',price:100,slot:'wall',description:'Bring a little night sky indoors.'},
 {id:'room-headphones',name:'Music corner',icon:'🎵',price:60,slot:'shelf',description:'A soundtrack for every small victory.'},
 {id:'room-crown',name:'Adventure crown',icon:'👑',price:120,slot:'hat',description:'Unlocked after three rewarded conversations.',sessions:3}
] as const;
export type Adventure={memoryEnabled:boolean;memories:string[];room:Record<string,string>};
export const emptyAdventure:Adventure={memoryEnabled:false,memories:[],room:{}};
export function reviewSchedule(previousInterval:number,correct:boolean,now=Date.now()){const interval=correct?Math.min(30,Math.max(1,previousInterval*2)):0;return {interval,last:now,due:now+(correct?interval*86400000:600000)}}
export function suitable(level:Level,minimum:string){return ['A1','A2','B1','B2','C1'].indexOf(level)>=['A1','A2','B1','B2','C1'].indexOf(minimum)}
export function phraseMatch(target:string,heard:string){const words=(s:string)=>s.toLowerCase().replace(/’/g,"'").replace(/[^a-z' ]/g,' ').split(/\s+/).filter(Boolean),a=words(target),b=words(heard);let i=0;const matched=a.map(w=>{const found=b.indexOf(w,i);if(found<0)return false;i=found+1;return true});return {words:a,matched,percent:Math.round(matched.filter(Boolean).length/Math.max(1,a.length)*100)}}
