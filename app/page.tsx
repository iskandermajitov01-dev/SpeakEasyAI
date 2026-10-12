import Studio from './studio';
import {getAppUser} from '@/lib/app-auth';
export const dynamic = 'force-dynamic';
export default async function Home() {
 const user=await getAppUser();
 return <Studio key={user?.userId||'guest'} user={user?{id:user.userId,name:user.fullName,username:user.username}:null}/>;
}
