'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');
const VERSION=require('../package.json').version, PUB=path.join(__dirname,'public'), PORT=43821;
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webmanifest':'application/manifest+json'};
const digest=v=>crypto.createHash('sha256').update(String(v)).digest('hex');
const equal=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const cleanName=v=>(String(v||'EcoOne device').replace(/[\u0000-\u001f<>]/g,'').trim()||'EcoOne device').slice(0,40);
const allowed=(d,s)=>({light:['turn_on','turn_off','toggle'],switch:['turn_on','turn_off','toggle'],media_player:['turn_on','turn_off','media_play','media_pause']}[d]||[]).includes(s);
const lan=()=>[...new Set(Object.values(os.networkInterfaces()).flat().filter(x=>x&&x.family==='IPv4'&&!x.internal).map(x=>x.address))];
function json(res,status,data){const body=JSON.stringify(data);res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(body)}
function body(req){return new Promise((resolve,reject)=>{let raw='',size=0;req.setEncoding('utf8');req.on('data',c=>{size+=Buffer.byteLength(c);if(size>131072){reject(Object.assign(Error('Request too large'),{status:413}));req.destroy()}else raw+=c});req.on('end',()=>{try{resolve(raw?JSON.parse(raw):{})}catch{reject(Object.assign(Error('Invalid JSON'),{status:400}))}});req.on('error',reject)})}
function local(address){return ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(address)}
function read(file,fallback){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return fallback}}
function write(file,data){const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data,null,2),{mode:0o600});fs.renameSync(tmp,file);try{fs.chmodSync(file,0o600)}catch{}}
async function startServer(opts={}){
 const dataDir=opts.dataDir||process.env.ECOONE_DATA_DIR||path.join(__dirname,'..','data');fs.mkdirSync(dataDir,{recursive:true});
 const df=path.join(dataDir,'devices.json'),cf=path.join(dataDir,'config.json');let devices=read(df,[]),config=read(cf,{});
 if(!Array.isArray(devices))devices=[];
 const code=String(crypto.randomInt(100000,1000000)),sockets=new Map(),wss=new WebSocketServer({noServer:true,maxPayload:32768});
 const find=token=>{if(!token||typeof token!=='string'||token.length>256)return null;const hash=digest(token);return devices.find(d=>equal(d.hash,hash))||null};
 const auth=req=>{const m=String(req.headers.authorization||'').match(/^Bearer\s+(.+)$/i);return m?find(m[1]):null};
 const save=()=>write(df,devices);
 async function ha(route,method='GET',payload){
  if(!config.url||!config.token)throw Object.assign(Error('Home Assistant has not been configured on the host computer.'),{status:409});
  const r=await fetch(config.url+route,{method,headers:{authorization:'Bearer '+config.token,'content-type':'application/json'},body:payload===undefined?undefined:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});
  const raw=await r.text();let data;try{data=raw?JSON.parse(raw):null}catch{}
  if(!r.ok)throw Object.assign(Error(data?.message||('Home Assistant HTTP '+r.status)),{status:502});return data;
 }
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){
   try{
    if(req.method==='GET'&&url.pathname==='/api/health')return json(res,200,{app:'EcoOne',version:VERSION,port:server.address()?.port||PORT,addresses:lan()});
    if(req.method==='POST'&&url.pathname==='/api/pair'){
     const b=await body(req);if(!equal(String(b.code||'').trim(),code))return json(res,401,{error:'Pairing code is incorrect. Check the host terminal.'});
     const token=crypto.randomBytes(32).toString('hex'),d={id:crypto.randomUUID(),name:cleanName(b.name),platform:String(b.platform||'Web').slice(0,24),hash:digest(token),addedAt:new Date().toISOString()};
     devices.push(d);save();console.log('[EcoOne] Paired '+d.name+' ('+d.platform+')');
     return json(res,201,{token,device:{id:d.id,name:d.name,platform:d.platform,addedAt:d.addedAt}});
    }
    const d=auth(req);if(!d)return json(res,401,{error:'This device is not paired. Enter the code shown by the EcoOne host.'});
    if(req.method==='GET'&&url.pathname==='/api/devices')return json(res,200,devices.map(x=>({id:x.id,name:x.name,platform:x.platform,addedAt:x.addedAt,online:sockets.has(x.id)})));
    if(req.method==='POST'&&url.pathname==='/api/unpair'){devices=devices.filter(x=>x.id!==d.id);sockets.get(d.id)?.close();sockets.delete(d.id);save();return json(res,200,{ok:true})}
    if(req.method==='GET'&&url.pathname==='/api/homeassistant/status')return json(res,200,{configured:!!(config.url&&config.token),url:config.url||null});
    if(req.method==='PUT'&&url.pathname==='/api/homeassistant/config'){
     if(!local(req.socket.remoteAddress))return json(res,403,{error:'Configure Home Assistant from http://localhost:43821 on the host computer.'});
     const b=await body(req);let u;try{u=new URL(String(b.url||''))}catch{throw Object.assign(Error('Enter a valid Home Assistant URL.'),{status:400})}
     if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Object.assign(Error('Use an HTTP or HTTPS URL without embedded credentials.'),{status:400});
     const token=String(b.token||'').trim();if(token.length<20||token.length>4096)throw Object.assign(Error('Paste your Home Assistant long-lived access token.'),{status:400});
     const prior=config;config={url:u.origin,token};try{await ha('/api/');write(cf,config)}catch(e){config=prior;throw e}
     return json(res,200,{ok:true,configured:true,url:config.url});
    }
    if(req.method==='GET'&&url.pathname==='/api/homeassistant/states'){
     const all=await ha('/api/states');return json(res,200,(Array.isArray(all)?all:[]).filter(x=>['light','switch','media_player'].includes(String(x.entity_id||'').split('.')[0])).slice(0,250).map(x=>({entity_id:x.entity_id,domain:x.entity_id.split('.')[0],name:x.attributes?.friendly_name||x.entity_id,state:x.state,available:!['unavailable','unknown'].includes(x.state)})));
    }
    if(req.method==='POST'&&url.pathname==='/api/homeassistant/service'){
     const b=await body(req),id=String(b.entity_id||''),[domain,obj]=id.split('.'),service=String(b.service||'');
     if(!obj||!/^[a-z0-9_]+$/i.test(obj)||!allowed(domain,service))return json(res,400,{error:'This Home Assistant action is not supported in EcoOne 0.1.'});
     await ha('/api/services/'+domain+'/'+service,'POST',{entity_id:id});return json(res,200,{ok:true});
    }
    return json(res,404,{error:'API route not found.'});
   }catch(e){return json(res,e.status||500,{error:e.message||'EcoOne request failed.'})}
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end('Method not allowed')}
  const alias={'/':'index.html','/tv':'index.html','/mobile':'index.html'},name=alias[url.pathname]||url.pathname.slice(1);
  const file=path.resolve(PUB,name);
  if(file!==PUB&&!file.startsWith(PUB+path.sep)){res.writeHead(403);return res.end('Forbidden')}
  let data;try{data=fs.readFileSync(file)}catch{res.writeHead(404);return res.end('Not found')}
  res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-cache','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' ws:; img-src 'self' data:; manifest-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});
  if(req.method==='HEAD')return res.end();res.end(data);
 });
 server.on('upgrade',(req,socket,head)=>{
  const u=new URL(req.url,'http://localhost');if(u.pathname!=='/socket'){socket.destroy();return}
  const d=find(u.searchParams.get('token'));if(!d){socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,d));
 });
 wss.on('connection',(ws,d)=>{sockets.set(d.id,ws);ws.send(JSON.stringify({type:'connected',id:d.id}));ws.on('message',raw=>{let m;try{m=JSON.parse(raw.toString())}catch{return}if(m.type!=='relay'||typeof m.to!=='string')return;const target=devices.find(x=>x.id===m.to),peer=target&&sockets.get(target.id);if(peer?.readyState===WebSocket.OPEN)peer.send(JSON.stringify({type:'relay',from:d.id,fromName:d.name,payload:m.payload}))});ws.on('close',()=>{if(sockets.get(d.id)===ws)sockets.delete(d.id)})});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(Number(opts.port||process.env.ECOONE_PORT||PORT),opts.host||'0.0.0.0',()=>{server.removeListener('error',reject);resolve()})});
 const port=server.address().port;console.log('\nEcoOne private server v'+VERSION+'\nLocal: http://localhost:'+port);
 for(const a of lan())console.log('LAN:   http://'+a+':'+port);
 console.log('Pairing code: '+code+'\nKeep this on your private home network. Do not port-forward port '+port+'.\n');
 return {server,port,code,close:()=>new Promise(resolve=>{for(const ws of wss.clients)ws.close();wss.close();server.close(resolve)})};
}
if(require.main===module)startServer().catch(e=>{console.error('[EcoOne] Start failed:',e.message);process.exitCode=1});
module.exports={startServer,cleanName,allowed};
