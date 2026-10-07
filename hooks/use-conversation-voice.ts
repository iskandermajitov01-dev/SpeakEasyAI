'use client';
import { useEffect, useRef, useState } from 'react';
type Options={onTranscript:(text:string)=>void;onError:(text:string)=>void;rate:number};
export function useConversationVoice(options:Options){
 const current=useRef(options);current.current=options;
 const [recording,setRecording]=useState(false),[transcribing,setTranscribing]=useState(false),[preparing,setPreparing]=useState(false),[speaking,setSpeaking]=useState(false),[live,setLive]=useState(false),[volume,setVolume]=useState(0);
 const recorder=useRef<MediaRecorder|null>(null),stream=useRef<MediaStream|null>(null),context=useRef<AudioContext|null>(null),audio=useRef<HTMLAudioElement|null>(null),url=useRef(''),request=useRef<AbortController|null>(null),raf=useRef(0),generation=useRef(0),wantLive=useRef(false),starting=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),discard=useRef(false),hasVoice=useRef(false);
 function stopAudio(){request.current?.abort();if(audio.current){audio.current.pause();audio.current.src='';audio.current=null}if(url.current){URL.revokeObjectURL(url.current);url.current=''}setSpeaking(false);setPreparing(false)}
 function releaseMic(){cancelAnimationFrame(raf.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;void context.current?.close().catch(()=>{});context.current=null;setVolume(0)}
 function pause(){wantLive.current=false;setLive(false);generation.current++;if(timer.current)clearTimeout(timer.current);discard.current=true;if(recorder.current?.state==='recording')recorder.current.stop();releaseMic();stopAudio();setRecording(false);setTranscribing(false)}
 async function listen(){
  if(starting.current||recorder.current?.state==='recording')return;
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined'){current.current.onError('Этот браузер не поддерживает запись. Откройте сайт в актуальном Chrome или Safari.');return}
  starting.current=true;stopAudio();const token=++generation.current;
  try{
   const mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   if(token!==generation.current){mic.getTracks().forEach(t=>t.stop());return}stream.current=mic;
   const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg;codecs=opus'].find(t=>MediaRecorder.isTypeSupported(t));
   const rec=new MediaRecorder(mic,mime?{mimeType:mime}:undefined);recorder.current=rec;const chunks:BlobPart[]=[];discard.current=false;hasVoice.current=false;
   const began=performance.now();let lastVoice=began,voiceFrames=0;const AC=window.AudioContext||(window as any).webkitAudioContext;
   if(AC){const ac=new AC();context.current=ac;await ac.resume();const source=ac.createMediaStreamSource(mic),analyser=ac.createAnalyser();analyser.fftSize=1024;source.connect(analyser);const data=new Uint8Array(analyser.fftSize);
    const meter=()=>{if(rec.state!=='recording')return;analyser.getByteTimeDomainData(data);let power=0;for(const v of data)power+=((v-128)/128)**2;const rms=Math.sqrt(power/data.length);setVolume(Math.min(1,rms*8));const now=performance.now();if(rms>.018){voiceFrames++;lastVoice=now;if(voiceFrames>8)hasVoice.current=true}if(hasVoice.current&&now-lastVoice>2200&&now-began>3000){rec.stop();return}if(now-began>60000){rec.stop();return}raf.current=requestAnimationFrame(meter)};
    rec.onstart=()=>{setRecording(true);raf.current=requestAnimationFrame(meter)};
   }else rec.onstart=()=>{setRecording(true);timer.current=setTimeout(()=>{if(rec.state==='recording')rec.stop()},60000)};
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   rec.onerror=()=>{current.current.onError('Запись прервалась. Нажмите микрофон ещё раз.');pause()};
   rec.onstop=async()=>{
    if(token!==generation.current)return;
    releaseMic();setRecording(false);recorder.current=null;if(timer.current)clearTimeout(timer.current);
    if(discard.current||token!==generation.current)return;
    const blob=new Blob(chunks,{type:rec.mimeType||mime||'audio/webm'});if(blob.size<200||(!!AC&&!hasVoice.current)){wantLive.current=false;setLive(false);current.current.onError('Не удалось услышать голос. Попробуйте ещё раз.');return}
    setTranscribing(true);const ctrl=new AbortController();request.current=ctrl;
    try{const form=new FormData();form.append('file',blob,blob.type.includes('mp4')?'speech.m4a':blob.type.includes('ogg')?'speech.ogg':'speech.webm');const r=await fetch('/api/transcribe',{method:'POST',body:form,signal:ctrl.signal});const result:any=await r.json();if(token!==generation.current)return;if(!r.ok)throw Error(result.error);if(!result.text){current.current.onError('Речь не распознана. Нажмите микрофон и попробуйте снова.');wantLive.current=false;setLive(false);return}setTranscribing(false);current.current.onTranscript(result.text)}catch(e:any){if(e.name!=='AbortError'){current.current.onError(e.message||'Ошибка распознавания.');wantLive.current=false;setLive(false)}}finally{if(token===generation.current)setTranscribing(false)}
   };
   rec.start(250);wantLive.current=true;setLive(true);
  }catch(e:any){releaseMic();wantLive.current=false;setLive(false);current.current.onError(e.name==='NotAllowedError'?'Разрешите доступ к микрофону в настройках браузера.':e.name==='NotFoundError'?'Микрофон не найден. Подключите его и попробуйте снова.':'Не удалось включить микрофон. Попробуйте ещё раз.')}finally{starting.current=false}
 }
 async function say(text:string){
  stopAudio();const token=++generation.current;setPreparing(true);const ctrl=new AbortController();request.current=ctrl;
  try{const r=await fetch('/api/speech',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:ctrl.signal});if(!r.ok){const d:any=await r.json();throw Error(d.error)}const blob=await r.blob();if(token!==generation.current)return;url.current=URL.createObjectURL(blob);const player=new Audio(url.current);audio.current=player;player.playbackRate=current.current.rate;player.preservesPitch=true;
   player.onplaying=()=>{if(token===generation.current){setSpeaking(true);setPreparing(false)}};
   player.onended=()=>{if(token!==generation.current)return;setSpeaking(false);if(url.current)URL.revokeObjectURL(url.current);url.current='';audio.current=null;if(wantLive.current)timer.current=setTimeout(()=>void listen(),250)};
   player.onerror=()=>{current.current.onError('Не удалось воспроизвести голос. Нажмите «Прослушать» ещё раз.');setSpeaking(false);setPreparing(false)};
   await player.play();
  }catch(e:any){if(token===generation.current){setPreparing(false);setSpeaking(false);if(e.name!=='AbortError'){wantLive.current=false;setLive(false);current.current.onError(e.name==='NotAllowedError'?'Браузер заблокировал звук. Нажмите «Прослушать» у сообщения.':e.message||'Голос временно недоступен.')}}}
 }
 function mic(){if(recorder.current?.state==='recording')recorder.current.stop();else void listen()}
 useEffect(()=>()=>{wantLive.current=false;generation.current++;if(timer.current)clearTimeout(timer.current);request.current?.abort();discard.current=true;if(recorder.current?.state==='recording')recorder.current.stop();cancelAnimationFrame(raf.current);stream.current?.getTracks().forEach(t=>t.stop());void context.current?.close().catch(()=>{});audio.current?.pause();if(url.current)URL.revokeObjectURL(url.current)},[]);
 return{recording,transcribing,preparing,speaking,live,volume,mic,say,pause};
}
