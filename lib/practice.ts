export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
export function weekDays(date=new Date()){const monday=new Date(date.getFullYear(),date.getMonth(),date.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);return ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((label,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);return {label,date:localDate(d),today:localDate(d)===localDate(date)}})}
export function currentStreak(dates:string[],now=new Date()){const set=new Set(dates),d=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(!set.has(localDate(d)))d.setDate(d.getDate()-1);let count=0;while(set.has(localDate(d))){count++;d.setDate(d.getDate()-1)}return count}
export type PracticeSession={id:string;date:string;topic:string;level:string;seconds:number;turns:number;xp:number};
export type PracticeStats={practiceSeconds:number;dailySeconds:Record<string,number>;dailyGoal:number;history:PracticeSession[]};
export type CoachReview={strength:string;tip:string;corrections:{original:string;better:string;explanation:string}[]};
