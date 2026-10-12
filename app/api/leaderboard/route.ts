import {getAppUser} from '@/lib/app-auth';
import {storage} from '@/db/storage';
export async function GET(){const user=await getAppUser();if(!user)return Response.json({error:'Sign in to see the community leaderboard.'},{status:401});try{
 const db=storage();const {results}=await db.prepare('SELECT user_id,display_name,xp,level,avatar,title FROM academy_profiles WHERE public=1 ORDER BY xp DESC, joined ASC LIMIT 50').all<any>();
 const me=await db.prepare('SELECT xp,public,joined FROM academy_profiles WHERE user_id=?').bind(user.userId).first<any>();
 const rank=me?.public?await db.prepare('SELECT COUNT(*)+1 AS n FROM academy_profiles WHERE public=1 AND (xp>? OR (xp=? AND joined<?))').bind(me.xp,me.xp,me.joined).first<{n:number}>():null;
 return Response.json({entries:results.map((r,i)=>({rank:i+1,name:r.display_name,xp:r.xp,level:r.level,avatar:r.avatar,title:r.title,me:r.user_id===user.userId})),rank:rank?.n??null},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Leaderboard unavailable. Please try again.'},{status:503})}}
