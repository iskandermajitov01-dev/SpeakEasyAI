import {storage} from '@/db/storage';
import {emptyAdventure} from '@/lib/adventures';
import {levels,type Academy} from '@/lib/academy';
export async function academy(userId:string):Promise<Academy|null>{
 const row=await storage().prepare('SELECT * FROM academy_profiles WHERE user_id=?').bind(userId).first<any>();if(!row)return null;
 const completed=await storage().prepare("SELECT event_key FROM academy_events WHERE user_id=? AND event_key LIKE 'mission:%'").bind(userId).all<{event_key:string}>();const rewarded=await storage().prepare("SELECT COUNT(*) AS n FROM academy_events WHERE user_id=? AND xp>0 AND event_key LIKE 'session:%'").bind(userId).first<{n:number}>();const daily=await storage().prepare('SELECT 1 FROM academy_events WHERE user_id=? AND event_key=?').bind(userId,'daily:'+utcDay()).first();const settings=JSON.parse(row.settings);return {displayName:row.display_name,level:levels.includes(row.level)?row.level:'A1',placed:row.placed,xp:row.xp,coins:row.coins,public:row.public,owned:JSON.parse(row.owned),theme:row.theme,avatar:row.avatar,title:row.title,levelSessions:row.level_sessions,customTopics:JSON.parse(row.custom_topics),dailyGoal:settings.dailyGoal||5,realistic:settings.realistic??false,sound:settings.sound??true,speed:settings.speed||1,joined:row.joined,adventure:{...emptyAdventure,...settings.adventure},rewardedSessions:rewarded?.n||0,dailyCompleted:!!daily,completedMissions:completed.results.map(e=>e.event_key.slice(8))};
}
export const utcDay=()=>new Date().toISOString().slice(0,10);
