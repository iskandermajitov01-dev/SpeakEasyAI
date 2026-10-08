import {storage} from '@/db/storage';
import {levels,type Academy} from '@/lib/academy';
export async function academy(userId:string):Promise<Academy|null>{
 const row=await storage().prepare('SELECT * FROM academy_profiles WHERE user_id=?').bind(userId).first<any>();if(!row)return null;
 const settings=JSON.parse(row.settings);return {displayName:row.display_name,level:levels.includes(row.level)?row.level:'A1',placed:row.placed,xp:row.xp,coins:row.coins,public:row.public,owned:JSON.parse(row.owned),theme:row.theme,avatar:row.avatar,title:row.title,levelSessions:row.level_sessions,customTopics:JSON.parse(row.custom_topics),dailyGoal:settings.dailyGoal||5,realistic:settings.realistic??false,sound:settings.sound??true,speed:settings.speed||1,joined:row.joined};
}
export const utcDay=()=>new Date().toISOString().slice(0,10);
