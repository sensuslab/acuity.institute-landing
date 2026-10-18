type RelocationEvents={on:(event:string,listener:()=>void)=>unknown;off:(event:string,listener:()=>void)=>unknown};
// EPUB.js resolves display()/next() before its next-frame "relocated" event.
// Keep controls busy until that event has updated the logical reading position.
export async function settleEbookNavigation(target:RelocationEvents,action:()=>Promise<unknown>,timeoutMs=1500){
  let arrived!:()=>void;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const relocation=new Promise<void>(resolve=>{arrived=resolve;});
  const listener=()=>arrived();target.on('relocated',listener);
  try{
    await action();
    await Promise.race([relocation,new Promise<void>(resolve=>{timer=setTimeout(resolve,timeoutMs);})]);
  }finally{target.off('relocated',listener);if(timer!==undefined)clearTimeout(timer);}
}
