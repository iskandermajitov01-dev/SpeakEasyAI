from pathlib import Path
p=Path(__file__).resolve().parents[1]/'app/studio.tsx'
s=p.read_text(encoding='utf-8')
s=s.replace("[seconds,setSeconds]=useState(0);","[seconds,setSeconds]=useState(0),[syncReady,setSyncReady]=useState(false),[syncStatus,setSyncStatus]=useState('');")
s=s.replace("const s=await r.json();setMode(s.ai", "const s:any=await r.json();setMode(s.ai")
s=s.replace("const body=await r.json();", "const body:any=await r.json();")
anchor=" useEffect(()=>{if(!active)return;"
addition=""" useEffect(()=>{if(!user){setSyncReady(false);return}let alive=true;fetch('/api/profile').then(async r=>{const d:any=await r.json();if(!r.ok)throw Error(d.error);if(!alive)return;if(d.profile){setStats({...initialStats,...d.profile.stats});setLevel(d.profile.level);setInterests(d.profile.interests)}setSyncReady(true);setSyncStatus('Прогресс синхронизирован')}).catch(()=>{if(alive)setSyncStatus('Синхронизация недоступна. Копия остаётся на устройстве.')});return()=>{alive=false}},[user?.email]);
 useEffect(()=>{if(!syncReady||!loaded||!user)return;const timer=setTimeout(()=>{fetch('/api/profile',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({stats,level,interests})}).then(r=>{if(!r.ok)throw Error();setSyncStatus('Прогресс синхронизирован')}).catch(()=>setSyncStatus('Не удалось синхронизировать. Копия остаётся на устройстве.'))},500);return()=>clearTimeout(timer)},[stats,level,interests,syncReady,loaded]);
"""
s=s.replace(anchor,addition+anchor)
s=s.replace('Прогресс, интересы и словарь пока хранятся только в этом браузере. Они не синхронизируются между устройствами.',"{user ? (syncStatus || 'Загружаем прогресс…') : 'Войдите, чтобы сохранять прогресс и словарь в аккаунте. Без входа доступна копия на этом устройстве.'}")
s=s.replace('Сохранено на устройстве',"{syncReady?'Сохранено в аккаунте':'На этом устройстве'}")
s=s.replace('Твой личный словарь на этом устройстве. Повторяй, слушай, используй.','Твой личный словарь. Повторяй, слушай, используй.')
s=s.replace('Твоя практика на этом устройстве — без сравнения с другими.','Твоя практика — без сравнения с другими.')
s=s.replace('ТВОЙ AI-СОБЕСЕДНИК','ТВОЙ СОБЕСЕДНИК ДЛЯ ПРАКТИКИ')
s=s.replace('Без оценок. Без страха. Просто практика.','Сценарная тренировка · свободный ИИ не подключён')
s=s.replace('• online','• рядом')
s=s.replace("<span className=\"streak\"><Flame size={17}/>{stats.dates.length} <span>дней практики</span>","<span className=\"streak\"><Flame size={17}/>{stats.dates.length} <span>дней с практикой</span>")
s=s.replace("const minutes=Math.max(1,Math.round((Date.now()-started.current)/60000))","const minutes=Math.floor((Date.now()-started.current)/60000)")
s=s.replace("if(!text.trim()||busy)return;", "if(!text.trim()||busy||listening)return;")
s=s.replace("void send(e.results[0][0].transcript)","setListening(false);void send(e.results[0][0].transcript)")
s=s.replace("disabled={busy||!input.trim()}","disabled={busy||listening||!input.trim()}")
s=s.replace("const date=new Date().toLocaleDateString('en-CA');", "const now=new Date();const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');")
p.write_text(s,encoding='utf-8')
