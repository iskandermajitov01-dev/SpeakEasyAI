import Studio from './studio';
import { getChatGPTUser } from './chatgpt-auth';
import {getAppUser} from '@/lib/app-auth';
import {storage} from '@/db/storage';
export const dynamic = 'force-dynamic';
export default async function Home() {
 const user=await getAppUser();
 let canImport=false;
 if(!user){
  const legacy=await getChatGPTUser();
  if(legacy){const db=storage();const profile=await db.prepare('SELECT 1 FROM academy_profiles WHERE user_id=?').bind(legacy.userId).first();const connected=await db.prepare('SELECT 1 FROM app_accounts WHERE user_id=?').bind(legacy.userId).first();canImport=!!profile&&!connected;}
 }
 return <Studio key={user?.userId||'guest'} user={user?{id:user.userId,name:user.fullName,username:user.username}:null} canImport={canImport}/>;
}
