const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
  try{
    const {site}=await req.json()
    const u=new URL(/^https?:/.test(site)?site:'http://'+site)
    const bad=/\.(png|jpg|jpeg|gif|webp|svg)$|example|sentry|wixpress/i
    let emails:string[]=[]
    for(const p of ['',u.origin+'/contato',u.origin+'/contact']){
      try{const r=await fetch(p||u.href,{signal:AbortSignal.timeout(6000)});const t=await r.text()
        emails.push(...(t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g)||[]))}catch{}
      if(emails.some(e=>!bad.test(e)))break
    }
    const email=emails.find(e=>!bad.test(e))||null
    return new Response(JSON.stringify({email}),{headers:{...cors,'Content-Type':'application/json'}})
  }catch(e){return new Response(JSON.stringify({email:null}),{headers:{...cors,'Content-Type':'application/json'}})}
})
