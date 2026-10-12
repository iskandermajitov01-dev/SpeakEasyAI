import {getChatGPTUser} from '@/app/chatgpt-auth';
import {storage} from '@/db/storage';
import {authJson,consumeAttempt,cookieValue,getAppUser,newSession,removeSession,sameOrigin} from '@/lib/app-auth';
import {dummyPasswordHash,hashPassword,validPassword,validUsername,verifyPassword} from '@/lib/passwords';

export async function GET(){
 try{const user=await getAppUser();return authJson({user:user?{id:user.userId,username:user.username,name:user.fullName}:null})}
 catch{return authJson({error:'Your account is temporarily unavailable. Please retry.'},503)}
}
export async function POST(request:Request){
 if(!sameOrigin(request))return authJson({error:'Please use the form on this site.'},403);
 if(Number(request.headers.get('content-length')||0)>4096)return authJson({error:'Request too large.'},413);
 try{
  const raw=await request.text();if(raw.length>4096)return authJson({error:'Request too large.'},413);
  let b:any;try{b=JSON.parse(raw)}catch{return authJson({error:'Invalid request.'},400)}
  if(!b||typeof b!=='object')return authJson({error:'Invalid request.'},400);
  if(b.action==='logout'){
   await removeSession();return authJson({ok:true},200,cookieValue(request,'',0));
  }
  if(!['register','login','password'].includes(b.action))return authJson({error:'Unknown action.'},400);
  // CF-Connecting-IP is supplied by the host; client forwarded-IP headers are ignored.
  const ip=request.headers.get('cf-connecting-ip')||'local';
  if(!await consumeAttempt(`auth-ip:${ip}`,60,15*60000))return authJson({error:'Too many attempts. Please try again in 15 minutes.'},429);
  const password=typeof b.password==='string'?b.password:'';
  if(password.length>128||!password)return authJson({error:'Enter your password (up to 128 characters).'},400);
  const db=storage();
  if(b.action==='password'){
   const user=await getAppUser();if(!user)return authJson({error:'Please sign in first.'},401);
   if(!await consumeAttempt(`password:${user.userId}:${ip}`,8,15*60000))return authJson({error:'Too many attempts. Please try again in 15 minutes.'},429);
   const next=typeof b.newPassword==='string'?b.newPassword:'';
   if(!validPassword(next))return authJson({error:'Choose a password of 12–128 characters.'},400);
   const row=await db.prepare('SELECT password_hash FROM app_accounts WHERE user_id=?').bind(user.userId).first<{password_hash:string}>();
   if(!row||!await verifyPassword(password,row.password_hash))return authJson({error:'Your current password is incorrect.'},401);
   const hash=await hashPassword(next);
   await db.batch([db.prepare('UPDATE app_accounts SET password_hash=? WHERE user_id=?').bind(hash,user.userId),db.prepare('DELETE FROM app_auth_sessions WHERE user_id=?').bind(user.userId)]);
   const session=await newSession(user.userId,false);
   return authJson({ok:true},200,cookieValue(request,session.token,session.seconds));
  }
  const username=typeof b.username==='string'?b.username.trim().toLowerCase():'';
  if(!validUsername(username))return authJson({error:'Use 3–24 letters (a–z), numbers, dots, hyphens or underscores. Start with a letter or number.'},400);
  if(!await consumeAttempt(`login:${ip}:${username}`,8,15*60000))return authJson({error:'Too many attempts for this login. Please try again in 15 minutes.'},429);
  let userId:string;
  if(b.action==='register'){
   if(!validPassword(password))return authJson({error:'Choose a password of 12–128 characters.'},400);
   if(!await consumeAttempt(`signup:${ip}`,5,60*60000))return authJson({error:'Too many registrations. Please try again in an hour.'},429);
   if(await getAppUser())return authJson({error:'Sign out before creating another account.'},409);
   const existing=await db.prepare('SELECT 1 FROM app_accounts WHERE username=?').bind(username).first();
   if(existing)return authJson({error:'That login is already taken. Try another one.'},409);
   userId='app_'+crypto.randomUUID();
   if(b.importProgress===true){
    const legacy=await getChatGPTUser();
    if(!legacy)return authJson({error:'Your previous sign-in expired. Create a new profile instead.'},409);
    const profile=await db.prepare('SELECT 1 FROM academy_profiles WHERE user_id=?').bind(legacy.userId).first();
    if(!profile)return authJson({error:'There is no previous profile to connect.'},409);
    userId=legacy.userId;
   }
   const hash=await hashPassword(password);
   try{await db.prepare('INSERT INTO app_accounts (user_id,username,password_hash,created) VALUES (?,?,?,?)').bind(userId,username,hash,Date.now()).run()}
   catch(e){if(String(e).includes('UNIQUE'))return authJson({error:'That login or previous profile already has an account. Please sign in or choose another login.'},409);throw e}
  }else{
   const row=await db.prepare('SELECT user_id,password_hash FROM app_accounts WHERE username=?').bind(username).first<{user_id:string;password_hash:string}>();
   const valid=await verifyPassword(password,row?.password_hash||dummyPasswordHash);
   if(!row||!valid)return authJson({error:'The login or password is incorrect.'},401);
   userId=row.user_id;
  }
  await removeSession();
  const session=await newSession(userId,b.remember===true);
  // Bounded housekeeping, only after authentication. Expired rows never authorize.
  await db.batch([db.prepare('DELETE FROM app_auth_sessions WHERE token_hash IN (SELECT token_hash FROM app_auth_sessions WHERE expires<? LIMIT 100)').bind(Date.now()),db.prepare('DELETE FROM app_auth_attempts WHERE bucket IN (SELECT bucket FROM app_auth_attempts WHERE expires<? LIMIT 100)').bind(Date.now())]);
  return authJson({ok:true},200,cookieValue(request,session.token,session.seconds));
 }catch{return authJson({error:'Could not connect to your account. Please try again.'},503)}
}
