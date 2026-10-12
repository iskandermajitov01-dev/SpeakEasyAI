import {getAppUser} from '@/lib/app-auth';
import {storage} from '@/db/storage';
import {academy,utcDay} from '@/lib/academy-server';
import {levels,questions,shop,topics,type Level} from '@/lib/academy';
import {missions,roomItems,suitable} from '@/lib/adventures';
const json=(d:unknown,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const user=await getAppUser();if(!user)return json({error:'Sign in to save your learning journey.'},401);try{return json({academy:await academy(user.userId)})}catch{return json({error:'Your profile is temporarily unavailable. Please retry.'},503)}}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Forbidden'},403);
 const user=await getAppUser();if(!user)return json({error:'Please sign in first.'},401);
 try{
 const raw=await request.text();if(raw.length>16000)return json({error:'Request too large.'},413);const b=JSON.parse(raw),db=storage(),id=user.userId,a=await academy(id);
 if(b.action==='register'){
  const name=typeof b.name==='string'?b.name.trim():'';if(name.length<2||name.length>30)return json({error:'Choose a display name of 2–30 characters.'},400);
  await db.prepare('INSERT OR IGNORE INTO academy_profiles (user_id,display_name,joined,settings) VALUES (?,?,?,?)').bind(id,name,new Date().toISOString(),JSON.stringify({dailyGoal:[5,10,15].includes(b.dailyGoal)?b.dailyGoal:5})).run();return json({academy:await academy(id)});
 }
 if(!a)return json({error:'Create your learning profile first.'},409);
 if(b.action==='settings'){
  if(typeof b.name!=='string'||b.name.trim().length<2||b.name.trim().length>30||typeof b.public!=='boolean'||![5,10,15].includes(b.dailyGoal)||typeof b.realistic!=='boolean'||typeof b.sound!=='boolean'||![.85,1,1.1].includes(b.speed))return json({error:'Please check your settings.'},400);
  await db.prepare('UPDATE academy_profiles SET display_name=?,public=?,settings=? WHERE user_id=?').bind(b.name.trim(),b.public?1:0,JSON.stringify({dailyGoal:b.dailyGoal,realistic:b.realistic,sound:b.sound,speed:b.speed,adventure:a.adventure}),id).run();
  }else if(b.action==='memory'){
  if(typeof b.enabled!=='boolean'||!Array.isArray(b.memories)||b.memories.length>8||b.memories.some((m:unknown)=>typeof m!=='string'||m.trim().length<2||m.length>160))return json({error:'Add up to 8 short notes (2–160 characters each).'},400);
  await db.prepare("UPDATE academy_profiles SET settings=json_set(settings,'$.adventure.memoryEnabled',json(?),'$.adventure.memories',json(?)) WHERE user_id=?").bind(JSON.stringify(b.enabled),JSON.stringify(b.memories.map((m:string)=>m.trim())),id).run();
 }else if(b.action==='buy-room'){
  const item=roomItems.find(x=>x.id===b.id);if(!item)return json({error:'Choose a room item.'},400);
  if('sessions' in item){const count=await db.prepare('SELECT COUNT(*) AS n FROM academy_events WHERE user_id=? AND xp>0 AND event_key LIKE ?').bind(id,'session:%').first<{n:number}>();if((count?.n||0)<item.sessions)return json({error:'Complete three rewarded conversations first.'},409)}
  const r=await db.prepare("UPDATE academy_profiles SET coins=coins-?,owned=json_insert(owned,'$[#]',?) WHERE user_id=? AND coins>=? AND NOT EXISTS(SELECT 1 FROM json_each(owned) WHERE value=?)").bind(item.price,item.id,id,item.price,item.id).run();if(!r.meta.changes)return json({error:'Not enough Sparks, or already owned.'},409);
 }else if(b.action==='decorate'){
  const item=roomItems.find(x=>x.id===b.id);if(!item||!a.owned.includes(item.id))return json({error:'Own this decoration first.'},403);
  await db.prepare("UPDATE academy_profiles SET settings=json_set(settings,?,?) WHERE user_id=?").bind('$.adventure.room.'+item.slot,b.remove?'':item.id,id).run();
 }else if(b.action==='topic'){

  const name=typeof b.name==='string'?b.name.trim():'',description=typeof b.description==='string'?b.description.trim():'';if(!name||name.length>70||description.length<5||description.length>300||a.customTopics.length>=20)return json({error:'Use a title under 70 characters and a description of 5–300 characters. You can save up to 20 topics.'},400);
  const t={id:crypto.randomUUID(),name,category:'Your topics',description,opening:`Let's talk about ${name}. What interests you about it?`,simple:`Do you like ${name}?`,custom:true};
  await db.prepare("UPDATE academy_profiles SET custom_topics=json_insert(custom_topics,'$[#]',json(?)) WHERE user_id=? AND json_array_length(custom_topics)<20").bind(JSON.stringify(t),id).run();
 }else if(b.action==='delete-topic'){
  const index=a.customTopics.findIndex(t=>t.id===b.id);if(index<0)return json({error:'Topic not found.'},404);
  await db.prepare("UPDATE academy_profiles SET custom_topics=json_remove(custom_topics,?) WHERE user_id=? AND custom_topics=?").bind(`$[${index}]`,id,JSON.stringify(a.customTopics)).run();
 }else if(b.action==='buy'){
  const item=shop.find(x=>x.id===b.id);if(!item)return json({error:'Item not found.'},404);if(a.owned.includes(item.id))return json({error:'You already own this item.'},409);
  const r=await db.prepare("UPDATE academy_profiles SET coins=coins-?,owned=json_insert(owned,'$[#]',?) WHERE user_id=? AND coins>=? AND NOT EXISTS(SELECT 1 FROM json_each(owned) WHERE value=?)").bind(item.price,item.id,id,item.price,item.id).run();if(!r.meta.changes)return json({error:'Not enough Sparks, or this item is already owned.'},409);
 }else if(b.action==='equip'){
  const item=shop.find(x=>x.id===b.id);if(b.id==='default'){await db.prepare("UPDATE academy_profiles SET theme='sky',avatar='',title='' WHERE user_id=?").bind(id).run()}
  else if(!item||!a.owned.includes(item.id))return json({error:'Buy this item before equipping it.'},403);
  else {const column=item.type==='theme'?'theme':item.type==='avatar'?'avatar':'title';await db.prepare(`UPDATE academy_profiles SET ${column}=? WHERE user_id=?`).bind(item.value,id).run()}
 }else if(b.action==='start-session'){
  if(!a.placed)return json({error:'Take the placement check first.'},409);const topic=[...topics,...a.customTopics].find(t=>t.id===b.topic);if(!topic)return json({error:'Choose a topic.'},400);
  const mission=b.mission?missions.find(m=>m.id===b.mission&&m.topic===topic.id):null;if(b.mission&&(!mission||!suitable(a.level,mission.level)))return json({error:'This mission needs a higher learning level.'},409);
  const sessionId=crypto.randomUUID();await db.prepare('INSERT INTO academy_sessions (id,user_id,level,topic,mission,created) VALUES (?,?,?,?,?,?)').bind(sessionId,id,a.level,topic.name,mission?.id||'',Date.now()).run();return json({sessionId,level:a.level,mission:mission||null});
 }else if(b.action==='finish-session'){
  const s=await db.prepare('SELECT * FROM academy_sessions WHERE id=? AND user_id=?').bind(b.id,id).first<any>();if(!s)return json({error:'Session not found.'},404);
  const seconds=Math.min(1200,Math.floor((Date.now()-s.created)/1000));if(s.claimed)return json({academy:a,reward:{xp:0,coins:0},seconds});
  const today=await db.prepare("SELECT COUNT(*) AS n FROM academy_events WHERE user_id=? AND xp>0 AND event_key LIKE ?").bind(id,`session:${utcDay()}:%`).first<{n:number}>();
  const eligible=s.turns>=3&&seconds>=60&&(today?.n||0)<10,mission=missions.find(m=>m.id===s.mission),goals=JSON.parse(s.goals||'[]');
  const bonus=eligible&&mission&&mission.goals.every((_,i)=>goals.includes(i))&&!a.completedMissions.includes(mission.id)?mission.reward:0,xp=eligible?40:0,coins=eligible?20:0;
  if(bonus&&mission)await db.batch([db.prepare('UPDATE academy_profiles SET xp=xp+60,coins=coins+? WHERE user_id=? AND NOT EXISTS(SELECT 1 FROM academy_events WHERE user_id=? AND event_key=?)').bind(bonus,id,id,'mission:'+mission.id),db.prepare('INSERT OR IGNORE INTO academy_events (user_id,event_key,xp,coins,created) VALUES (?,?,60,?,?)').bind(id,'mission:'+mission.id,bonus,new Date().toISOString())]);
  await db.batch([db.prepare('UPDATE academy_profiles SET xp=xp+?,coins=coins+?,level_sessions=level_sessions+? WHERE user_id=? AND EXISTS(SELECT 1 FROM academy_sessions WHERE id=? AND user_id=? AND claimed=0)').bind(xp,coins,eligible&&s.level===a.level?1:0,id,s.id,id),db.prepare('INSERT OR IGNORE INTO academy_events (user_id,event_key,xp,coins,created) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM academy_sessions WHERE id=? AND user_id=? AND claimed=0)').bind(id,`session:${utcDay()}:${s.id}`,xp,coins,new Date().toISOString(),s.id,id),db.prepare('UPDATE academy_sessions SET claimed=1 WHERE id=? AND user_id=?').bind(s.id,id)]);
  return json({academy:await academy(id),reward:{xp:xp+(bonus?60:0),coins:coins+bonus},missionComplete:!!bonus,seconds,turns:s.turns,message:bonus?'Mission complete! +100 XP · +50 Sparks':eligible?'Conversation complete! +40 XP · +20 Sparks':s.turns<3||seconds<60?'Saved! For rewards, practise for 1 minute and send at least 3 replies.':'Saved! Today’s 10 rewarded conversations are complete.'});
 }else if(b.action==='start-test'){
  if(!['placement','mastery','daily'].includes(b.kind))return json({error:'Unknown assessment.'},400);
  if(b.kind==='mastery'&&(!a.placed||a.level==='C1'||a.levelSessions<3))return json({error:'Complete 3 rewarded conversations at your level to unlock a level-up check.'},409);
  if(b.kind==='daily'&&!a.placed)return json({error:'Take your placement check first.'},409);
  const kind=b.kind,day=utcDay();if(kind==='daily'&&await db.prepare('SELECT 1 FROM academy_events WHERE user_id=? AND event_key=?').bind(id,`daily:${day}`).first())return json({error:'Today’s challenge is complete. Come back tomorrow (UTC).'},409);
  const cutoff=Date.now()-3600000;const recent=await db.prepare('SELECT COUNT(*) AS n FROM academy_tests WHERE user_id=? AND created>?').bind(id,cutoff).first<{n:number}>();if((recent?.n||0)>=15)return json({error:'Please take a break before starting another check.'},429);
  const shuffled=[...questions].sort(()=>Math.random()-.5),selected=kind==='placement'?levels.flatMap(l=>shuffled.filter(q=>q.level===l).slice(0,3)):kind==='mastery'?shuffled.filter(q=>q.level===levels[levels.indexOf(a.level)+1]).slice(0,6):shuffled.filter(q=>q.level===a.level).slice(0,3);
  const testId=crypto.randomUUID();await db.prepare('INSERT INTO academy_tests (id,user_id,kind,level,questions,created) VALUES (?,?,?,?,?,?)').bind(testId,id,kind,a.level,JSON.stringify(selected.map(q=>q.id)),Date.now()).run();return json({test:{id:testId,kind,questions:selected.map(({answer,explanation,...q})=>q)}});
 }else if(b.action==='submit-test'){
  const test=await db.prepare('SELECT * FROM academy_tests WHERE id=? AND user_id=?').bind(b.id,id).first<any>();if(!test||test.submitted||Date.now()-test.created>3600000)return json({error:'This check has expired or was already submitted. Start a new one.'},409);
  const qs=JSON.parse(test.questions).map((q:string)=>questions.find(x=>x.id===q));if(!Array.isArray(b.answers)||b.answers.length!==qs.length||b.answers.some((v:unknown)=>!Number.isInteger(v)||Number(v)<0||Number(v)>2))return json({error:'Answer every question first.'},400);
  const score=qs.filter((q:any,i:number)=>q.answer===b.answers[i]).length;let newLevel:Level=a.level,passed=false;
  if(test.kind==='placement'){newLevel='A1';for(const l of levels){const indices=qs.map((q:any,i:number)=>q.level===l?i:-1).filter((i:number)=>i>=0);if(indices.filter((i:number)=>qs[i].answer===b.answers[i]).length>=2)newLevel=l;else break}passed=true}
  if(test.kind==='mastery'){passed=score>=5&&a.level===test.level&&a.levelSessions>=3;if(passed)newLevel=levels[Math.min(4,levels.indexOf(a.level)+1)]}
  const eventKey=test.kind==='daily'?`daily:${utcDay()}`:test.kind==='placement'?'placement':`mastery:${newLevel}`;
  const xp=test.kind==='daily'?score*10:passed?test.kind==='placement'?30:100:0,coins=test.kind==='daily'?score*5:passed?test.kind==='placement'?30:50:0;
  const updates=[db.prepare('UPDATE academy_profiles SET xp=xp+?,coins=coins+? WHERE user_id=? AND NOT EXISTS(SELECT 1 FROM academy_events WHERE user_id=? AND event_key=?)').bind(xp,coins,id,id,eventKey),db.prepare('INSERT OR IGNORE INTO academy_events (user_id,event_key,xp,coins,created) VALUES (?,?,?,?,?)').bind(id,eventKey,xp,coins,new Date().toISOString())];
  if(passed)updates.push(db.prepare('UPDATE academy_profiles SET level=?,placed=1,level_sessions=CASE WHEN level=? THEN level_sessions ELSE 0 END WHERE user_id=? AND level=?').bind(newLevel,newLevel,id,a.level));
  updates.push(db.prepare('UPDATE academy_tests SET submitted=1 WHERE id=? AND user_id=? AND submitted=0').bind(test.id,id));await db.batch(updates);
  return json({academy:await academy(id),result:{level:newLevel,score,total:qs.length,passed,kind:test.kind,breakdown:qs.map((q:any,i:number)=>({q:q.q,chosen:q.choices[b.answers[i]],answer:q.choices[q.answer],explanation:q.explanation,correct:q.answer===b.answers[i]}))}});
 }else return json({error:'Unknown action.'},400);
 return json({academy:await academy(id)});
 }catch(e){return json({error:e instanceof SyntaxError?'Invalid request.':'Could not save this change. Please retry.'},e instanceof SyntaxError?400:503)}
}
