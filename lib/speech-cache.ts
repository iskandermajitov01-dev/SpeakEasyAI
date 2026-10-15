// Memory-only audio cache, private to this mounted learning account.
export class SpeechCache {
 private entries=new Map<string,Blob>();
 private bytes=0;
 private maxEntries:number;
 private maxBytes:number;
 constructor(maxEntries=12,maxBytes=8_000_000){this.maxEntries=maxEntries;this.maxBytes=maxBytes}
 get(text:string){
  const blob=this.entries.get(text);
  if(blob){this.entries.delete(text);this.entries.set(text,blob)}
  return blob;
 }
 set(text:string,blob:Blob){
  if(blob.size>this.maxBytes)return;
  const old=this.entries.get(text);if(old){this.bytes-=old.size;this.entries.delete(text)}
  this.entries.set(text,blob);this.bytes+=blob.size;
  while(this.entries.size>this.maxEntries||this.bytes>this.maxBytes){
   const oldest=this.entries.keys().next().value;if(oldest===undefined)break;
   this.bytes-=this.entries.get(oldest)!.size;this.entries.delete(oldest);
  }
 }
 clear(){this.entries.clear();this.bytes=0}
}
