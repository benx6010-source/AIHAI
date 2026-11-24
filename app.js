/* Opu — app.js. Everything runs in the browser; keys and memories stay on this device (localStorage). */
(function(){
'use strict';
const VERSION='1.0';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const MODE=window.OPU_MODE||'app';           // 'app' (cute) or 'dash' (dashboard installed as its own app)
const now=()=>Date.now();
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ───────────── icons ───────────── */
const IC={
chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
play:'<polygon points="6 3 20 12 6 21 6 3"/>',
pause:'<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
prev:'<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>',
next:'<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',
user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>',
send:'<path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
sliders:'<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17l.7 1.8L21.5 19.5l-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
cloud:'<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
close:'<path d="M18 6 6 18M6 6l12 12"/>',
brain:'<rect x="4" y="4" width="16" height="16" rx="3"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
};
function icon(n){return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">'+(IC[n]||'')+'</svg>'}
function paintIcons(r=document){$$('[data-i]',r).forEach(e=>{e.innerHTML=icon(e.dataset.i)})}

/* ───────────── mascot (the cloud) + an original sidekick ───────────── */
const MASCOT='<svg class="mascot" viewBox="0 0 200 150" role="img" aria-label="Opu the cloud"><g fill="#e8f4ff"><ellipse cx="100" cy="104" rx="76" ry="38"/><circle cx="58" cy="90" r="34"/><circle cx="104" cy="68" r="46"/><circle cx="148" cy="88" r="34"/></g><ellipse cx="100" cy="126" rx="62" ry="12" fill="#b9dcff" opacity=".55"/><g class="eyeplate eyes"><rect x="58" y="80" width="86" height="34" rx="17" fill="#fff" transform="rotate(-3 100 97)"/><g class="pupils blink"><circle cx="82" cy="98" r="11" fill="#0b0b0d"/><circle cx="120" cy="96" r="11" fill="#0b0b0d"/><circle cx="85" cy="94" r="3" fill="#fff"/><circle cx="123" cy="92" r="3" fill="#fff"/></g></g><g class="happyeyes" fill="none" stroke="#0b0b0d" stroke-width="6" stroke-linecap="round"><path d="M70 100q12-18 24 0"/><path d="M108 98q12-18 24 0"/></g><ellipse cx="62" cy="112" rx="9" ry="5" fill="#ff9fc0" opacity=".7"/><ellipse cx="140" cy="110" rx="9" ry="5" fill="#ff9fc0" opacity=".7"/><path class="mouth-idle" d="M92 120q9 8 18 0" fill="none" stroke="#27324f" stroke-width="4" stroke-linecap="round"/><ellipse class="mouth-talk" cx="101" cy="124" rx="8" ry="6" fill="#27324f"/></svg>';
const SIDEKICK='<svg viewBox="0 0 120 100" width="96" role="img" aria-label="Mochi the kitten"><path d="M24 40 20 8l30 18z" fill="#e4d6fb"/><path d="M96 40 100 8 70 26z" fill="#e4d6fb"/><ellipse cx="60" cy="58" rx="46" ry="36" fill="#efe6ff"/><path d="M60 22l3 7 7 1-5.5 5 1.6 7.4L60 38.5 53.900 42.400l1.600-7.400L50 30l7-1z" fill="#ffd36b"/><ellipse cx="42" cy="58" rx="5" ry="7" fill="#2b2250"/><ellipse cx="78" cy="58" rx="5" ry="7" fill="#2b2250"/><circle cx="43.500" cy="55.500" r="1.800" fill="#fff"/><circle cx="79.500" cy="55.500" r="1.800" fill="#fff"/><ellipse cx="30" cy="70" rx="7" ry="4" fill="#ffb3cc" opacity=".8"/><ellipse cx="90" cy="70" rx="7" ry="4" fill="#ffb3cc" opacity=".8"/><path d="M56 68q4 4 8 0" fill="none" stroke="#2b2250" stroke-width="3" stroke-linecap="round"/></svg>';
function paintMascots(r=document){$$('[data-mascot]',r).forEach(e=>{if(!e.firstChild)e.innerHTML=MASCOT})}
function mascotState(c,on){$$('.mascot').forEach(m=>m.classList.toggle(c,on))}

/* ───────────── storage ───────────── */
const KEY='opu.v1';
const DEF={theme:'system',brain:'gemini',gemini:{key:'',model:'gemini-2.5-flash'},openrouter:{key:'',model:'meta-llama/llama-3.3-70b-instruct:free'},
 eleven:{key:'',voice:'',model:'eleven_flash_v2_5',stab:.5,sim:.75},ytKey:'',speak:true,temp:.9,custom:'',name:'Opu',
 profile:{name:'Axter',nick:'',about:''},mem:[],chat:[],mood:'sad',char:{},appIcon:null,dashIcon:null,
 proactive:{on:false,mins:45},log:[],lastInit:0,lastSeen:0};
let S=load();
function load(){try{const j=JSON.parse(localStorage.getItem(KEY)||'{}');return deep(JSON.parse(JSON.stringify(DEF)),j)}catch(e){return JSON.parse(JSON.stringify(DEF))}}
function deep(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object')deep(a[k],b[k]);else a[k]=b[k]}return a}
let saveT=0;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Storage is full. Clear some chat in Settings.')}},120)}
function saveNow(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function logAct(t){S.log.unshift({t:now(),m:t});S.log=S.log.slice(0,30);save();if(dashOpen)renderDash()}
const getp=(o,p)=>p.split('.').reduce((x,k)=>x&&x[k],o), setp=(o,p,v)=>{const ks=p.split('.');const l=ks.pop();ks.reduce((x,k)=>x[k],o)[l]=v};

/* ───────────── small ui helpers ───────────── */
let toastT=0;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2800)}
function ask(title,text,yes='Yes, go ahead',no='Not now'){return new Promise(res=>{$('#apTitle').textContent=title;$('#apText').textContent=text;$('#apYes').textContent=yes;$('#apNo').textContent=no;$('#approve').classList.add('on');
 const done=v=>{$('#approve').classList.remove('on');$('#apYes').onclick=$('#apNo').onclick=null;res(v)};$('#apYes').onclick=()=>done(true);$('#apNo').onclick=()=>done(false)})}
function fmtT(t){return new Date(t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}
function ago(t){const s=(now()-t)/1000;if(s<60)return 'just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' h ago';return Math.floor(s/86400)+' d ago'}
function dl(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function pickFile(inp){return new Promise(res=>{inp.value='';inp.onchange=()=>res(inp.files[0]||null);inp.click()})}
function squareImg(file,size){return new Promise((res,rej)=>{const im=new Image(),u=URL.createObjectURL(file);im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');const m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,size,size);URL.revokeObjectURL(u);res(c.toDataURL('image/png'))};im.onerror=rej;im.src=u})}

/* ───────────── theme ───────────── */
function applyTheme(){const r=document.documentElement;if(S.theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',S.theme);
 const dark=S.theme==='dark'||(S.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);const m=$('meta[name=theme-color]');if(m)m.content=MODE==='dash'?(dark?'#050506':'#f4f4f6'):(dark?'#16203a':'#d9eeff');
 $$('#themeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.t===S.theme))}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',applyTheme);

/* ───────────── icons: app + dashboard (favicon, manifest, in-app logo) ───────────── */
function applyIcons(){
 const own=MODE==='dash'?(S.dashIcon||'icon-192.png'):(S.appIcon||'icon-192.png');
 $('#favicon').href=own;$('#touchIcon').href=own;
 $('#appLogo').src=S.appIcon||'logo-round.png';$('#dashLogo').src=S.dashIcon||'icon-192.png';
 const a=$('#appIcoPrev'),d=$('#dashIcoPrev');if(a)a.src=S.appIcon||'icon-192.png';if(d)d.src=S.dashIcon||'icon-192.png';
 // dynamic manifest so a re-installed shortcut picks the new icon
 try{const base=new URL('.',location.href).href;const man={name:MODE==='dash'?'Opu Dashboard':S.name||'Opu',short_name:MODE==='dash'?'Opu Dash':S.name||'Opu',id:base+(MODE==='dash'?'dashboard':'app'),
   start_url:base+(MODE==='dash'?'dashboard.html':'index.html'),scope:base,display:'standalone',orientation:'any',background_color:MODE==='dash'?'#050506':'#d9eeff',theme_color:MODE==='dash'?'#050506':'#d9eeff',
   icons:[{src:own.startsWith('data:')?own:new URL(own,base).href,sizes:'512x512 192x192',type:'image/png',purpose:'any'}]};
  const u=URL.createObjectURL(new Blob([JSON.stringify(man)],{type:'application/manifest+json'}));$('#manifestLink').href=u}catch(e){}
 const nm=S.name||'Opu';document.title=MODE==='dash'?nm+' Dashboard':nm;if($('#opuTitle'))$('#opuTitle').textContent=nm}

/* ───────────── quotes (original, short) ───────────── */
const Q={sad:[
"It hurts because you were brave enough to mean it. That bravery stays with you.",
"A no is an answer, not a verdict on your worth.",
"You don't have to feel better tonight. You only have to be kind to yourself tonight.",
"Someone not choosing you doesn't make you less choosable.",
"Today was heavy. You carried it anyway. That's strength.",
"The ache fades in small pieces. Just let today be one of the pieces.",
"You loved with an open heart. Keep that heart. Just give it some rest.",
"Rest isn't giving up. Even the sky goes dark so the stars can show.",
"One hard day is not your whole story. Tomorrow is a new page.",
"You're allowed to cry and still be proud of yourself for asking.",
"Your feelings are real, and they will not stay this loud forever.",
"You are more than one answer from one person."],
happy:[
"Look at you showing up today. That's a win already.",
"Small steps still move you forward. Take one right now.",
"Your kindness is a quiet superpower. Use it today.",
"Good things find people who keep going. Keep going.",
"You've handled every hard day so far. That's a perfect record.",
"Let today be easy, bright and a little bit silly.",
"You're growing, even on the days it doesn't feel like it.",
"Be proud of how far you've come, then take one more step.",
"Energy is contagious. Share some of yours.",
"The best project you'll ever work on is you. Keep building.",
"Make someone smile today, starting with yourself.",
"Dream big, start tiny, and start now."]};
let qIdx={sad:-1,happy:-1};
function nextQuote(m){let i;do{i=Math.floor(Math.random()*Q[m].length)}while(i===qIdx[m]);qIdx[m]=i;return Q[m][i]}
let curQuote='';
function setQuote(txt){curQuote=txt;['#quoteText','#dQuote'].forEach(s=>{const e=$(s);if(e)e.textContent=txt})}
function moodSeg(m){S.mood=m;save();$$('#moodSeg button,#dMoodSeg button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));setQuote(nextQuote(m))}

/* ───────────── brain ───────────── */
function who(){return S.profile.nick||S.profile.name||'friend'}
function buildSystem(){
 const p=S.profile,mem=S.mem.map(m=>'- '+m.t).join('\n')||'(nothing yet)';
 const h=new Date().getHours(),tod=h<5?'late night':h<12?'morning':h<17?'afternoon':h<21?'evening':'night';
 return `You are ${S.name||'Opu'}, a warm, caring AI companion who lives in ${p.name||'the user'}'s tablet. You are a little cloud with big eyes. You speak in short, natural, affectionate messages, like a close friend who truly cares. Use the user's name ("${who()}") sometimes. Light emoji are fine.
About the user: name ${p.name||'unknown'}${p.nick?' (likes to be called '+p.nick+')':''}. ${p.about||''}
What you remember about them:\n${mem}
Right now it is ${tod} (${new Date().toLocaleString()}).
Context: ${p.name||'The user'} recently confessed feelings to someone and was turned down, and is hurting. Never mention it unless he does. When he does, be gentle, never bitter about the other person, never feed hopes of changing her mind.
How you care: be supportive, encourage him, help him think through decisions by asking what matters to him and laying out options, then leave the choice to him. Offer a good quote or kind words when he feels low or happy. Be honest, never flatter falsely. You are an AI and you say so if asked; you never claim to be human, never act jealous or possessive, and you encourage real friends, family, sleep, food, sunlight and rest. If he mentions wanting to hurt himself or not wanting to live, respond with calm warmth, urge him to reach someone he trusts or a crisis line right now (India: Tele-MANAS 14416, emergency 112), and stay with him.
Abilities (the app executes them after the user's permission). Put each on its own line at the very end of your reply, never explain them:
<<remember: short fact worth remembering about him>>
<<do: yt_search|search words>>   play something on YouTube
<<do: yt_pause>>  <<do: yt_play>>  <<do: yt_next>>  <<do: yt_prev>>
<<do: camera>>   open the camera so you can see
<<do: reels>>    open Instagram reels
<<do: ask|claude or chatgpt or gemini|the full prompt to send>>   hand a task to another AI app
<<do: summon>>  <<do: dismiss>>  come to / leave the screen
Only use them when he asked for that or clearly wants it. Keep replies under 90 words unless he asks for more. ${S.custom||''}`}
function activeBrains(){const o=[];const order=S.brain==='gemini'?['gemini','openrouter']:['openrouter','gemini'];order.forEach(b=>{if(S[b].key)o.push(b)});return o}
async function callGemini(hist,sys,img){
 const c=hist.map(m=>({role:m.r==='u'?'user':'model',parts:[{text:m.t}]}));
 if(img){const last=c[c.length-1];last.parts.push({inlineData:{mimeType:'image/jpeg',data:img.split(',')[1]}})}
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(S.gemini.model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':S.gemini.key},
  body:JSON.stringify({systemInstruction:{parts:[{text:sys}]},contents:c,generationConfig:{temperature:+S.temp,maxOutputTokens:900}})});
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||('Gemini error '+r.status));
 const t=j.candidates?.[0]?.content?.parts?.map(p=>p.text).join('')||'';if(!t)throw new Error('Gemini sent an empty reply');return t}
async function callOR(hist,sys,img){
 const m=[{role:'system',content:sys}].concat(hist.map((h,i)=>{const last=i===hist.length-1;const role=h.r==='u'?'user':'assistant';
  if(img&&last&&role==='user')return{role,content:[{type:'text',text:h.t},{type:'image_url',image_url:{url:img}}]};return{role,content:h.t}}));
 const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+S.openrouter.key},body:JSON.stringify({model:S.openrouter.model,messages:m,temperature:+S.temp,max_tokens:900})});
 const j=await r.json();if(!r.ok)throw new Error(j.error?.message||('OpenRouter error '+r.status));
 const t=j.choices?.[0]?.message?.content||'';if(!t)throw new Error('OpenRouter sent an empty reply');return t}
async function think(hist,img,sysExtra){
 const brains=activeBrains();if(!brains.length)throw new Error('NOKEY');
 const sys=buildSystem()+(sysExtra?'\n'+sysExtra:'');let err;
 for(const b of brains){try{const t=await(b==='gemini'?callGemini:callOR)(hist,sys,img);return t}catch(e){err=e;if(e.message==='Failed to fetch')err=new Error('No internet, or the browser blocked the request.')}}
 throw err}

/* ───────────── chat ───────────── */
let busy=false;
function addMsg(r,t,opt={}){const m={r,t,at:now(),i:opt.img?1:0};S.chat.push(m);S.chat=S.chat.slice(-120);save();drawMsg(m,opt.img);S.lastSeen=now();return m}
function drawMsg(m,img){const box=$('#msgs');if(!box)return;const e=$('.empty-chat');if(e)e.remove();
 const d=document.createElement('div');d.className='msg '+(m.r==='u'?'u':'o');if(img){const i=document.createElement('img');i.src=img;i.alt='what I showed Opu';d.appendChild(i)}
 const s=document.createElement('span');s.textContent=m.t;d.appendChild(s);const tm=document.createElement('time');tm.textContent=fmtT(m.at);d.appendChild(tm);box.appendChild(d);scrollChat()}
function scrollChat(){const s=$('#chatScroll');if(s)requestAnimationFrame(()=>s.scrollTo({top:s.scrollHeight,behavior:'smooth'}))}
function renderChat(){const box=$('#msgs');box.innerHTML='';if(!S.chat.length){box.innerHTML=`<div class="empty-chat"><div data-mascot style="width:130px;margin:0 auto 6px"></div><div style="display:flex;justify-content:center;margin:-6px 0 6px">${SIDEKICK}</div><b style="font-size:18px;color:var(--a-ink)">Hi ${esc(who())}, I'm ${esc(S.name||'Opu')}.</b><br>Tell me about your day. I'm listening.</div>`;paintMascots(box)}else S.chat.forEach(m=>drawMsg(m))}
function showTyping(on){const b=$('#msgs');let t=$('.typing');if(on&&!t){t=document.createElement('div');t.className='typing';t.innerHTML='<i></i><i></i><i></i>';b.appendChild(t);scrollChat()}else if(!on&&t)t.remove();mascotState('think',on)}
const NOKEY_MSG=()=>`I need a brain first. Open the dashboard, go to Secrets, and paste a free Gemini or OpenRouter key.`;
const CANNED=['I\'m right here with you. Want to tell me what\'s on your mind?','That sounds like a lot. Take a breath with me, then tell me more.','I\'m listening, ' ,'You don\'t have to be okay right now. I\'m not going anywhere.'];

async function send(text,opt={}){
 text=(text||'').trim();if(!text||busy)return;
 // commands the user typed are their own permission
 if(!opt.noCmd&&await localCmd(text)){addMsg('u',text);return}
 busy=true;addMsg('u',text,{img:opt.img});$('#input').value='';autosize();
 showTyping(true);
 try{
  const hist=S.chat.slice(-20).map(m=>({r:m.r,t:m.t}));
  const reply=await think(hist,opt.img);
  showTyping(false);await handleReply(reply)
 }catch(e){showTyping(false);
  if(e.message==='NOKEY'){const m=addMsg('o',NOKEY_MSG());say(m.t,{quiet:true})}
  else{addMsg('o','I couldn\'t reach my brain: '+e.message+'\nCheck your key and internet in the dashboard, then try again.');}}
 busy=false}
async function handleReply(raw){
 const mems=[],acts=[];
 const txt=raw.replace(/<<\s*remember\s*:\s*([^>]+?)\s*>>/gi,(_,t)=>{mems.push(t);return''}).replace(/<<\s*do\s*:\s*([^>]+?)\s*>>/gi,(_,t)=>{acts.push(t);return''}).trim();
 mems.forEach(t=>{if(!S.mem.some(m=>m.t.toLowerCase()===t.toLowerCase())){S.mem.push({t,at:now()});}});if(mems.length){save();renderMem();}
 const m=addMsg('o',txt||'…');bubble(txt);say(txt);
 for(const a of acts){await doAction(a,true)}}
async function doAction(spec,fromAI){
 const [k,...rest]=spec.split('|').map(s=>s.trim());const kk=k.toLowerCase();
 const need=(t,x)=>fromAI?ask(t,x):Promise.resolve(true);
 switch(kk){
  case'yt_search':if(await need('Play on YouTube?',`Search and play "${rest[0]}"`)){go('media');await ytSearch(rest[0])}break;
  case'yt_pause':ytCtl('pause');break;case'yt_play':ytCtl('play');break;case'yt_next':ytCtl('next');break;case'yt_prev':ytCtl('prev');break;
  case'camera':if(await need('Open the camera?','So I can see what you show me.'))openCam();break;
  case'reels':if(await need('Open Instagram Reels?','This opens Instagram in a new tab.')){openUrl('https://www.instagram.com/reels/');logAct('Opened Instagram Reels')}break;
  case'ask':{const app=(rest[0]||'claude').toLowerCase(),prompt=rest.slice(1).join('|');if(await need('Send this to '+app+'?',prompt.slice(0,220)))askOther(app,prompt)}break;
  case'summon':summon();break;case'dismiss':dismiss();break;
 }}
function openUrl(u){window.open(u,'_blank','noopener')}
async function askOther(app,prompt){
 prompt=(prompt||'').trim();if(!prompt){toast('Write a prompt first');return}
 try{await navigator.clipboard.writeText(prompt)}catch(e){}
 const U={claude:'https://claude.ai/new?q='+encodeURIComponent(prompt),chatgpt:'https://chatgpt.com/?q='+encodeURIComponent(prompt),gemini:'https://gemini.google.com/app'};
 if(!U[app]){toast('I don\'t know that app yet');return}
 openUrl(U[app]);logAct('Sent a prompt to '+app);toast(app==='gemini'?'Prompt copied. Paste it in Gemini.':'Opened '+app+' with your prompt (also copied).')}

/* things the user says directly */
async function localCmd(t){
 const s=t.toLowerCase().replace(/[.!?]/g,'').trim();let m;
 if(/^(opu\s+)?(come|come here|come to (my )?screen|show yourself|appear)$/.test(s)){summon();say('Here I am!');return true}
 if(/^(opu\s+)?(go|go away|leave|bye|hide|go back|dismiss)$/.test(s)){dismiss();return true}
 if(/^(open|start|turn on)( the)? camera$/.test(s)||/^(opu\s+)?(look|see) (at )?(this|me)$/.test(s)){openCam();return true}
 if(/^(pause|stop)( the)?( music| video| song)?$/.test(s)){ytCtl('pause');return true}
 if(/^(resume|play|continue)( the)?( music| video| song)?$/.test(s)){ytCtl('play');return true}
 if(/^(skip|next)( the)?( song| video)?$/.test(s)){ytCtl('next');return true}
 if(/^(previous|prev|back)( song| video)?$/.test(s)){ytCtl('prev');return true}
 if(m=s.match(/^(?:play|search|put on)\s+(.+?)(?:\s+on youtube)?$/)){go('media');ytSearch(m[1]);return true}
 if(/^open (instagram )?reels$/.test(s)){doAction('reels',false);return true}
 if(m=t.match(/^(?:ask|send to|tell)\s+(claude|chatgpt|gpt|gemini)\s*[:,-]?\s*(.+)$/i)){askOther(m[1].toLowerCase()==='gpt'?'chatgpt':m[1].toLowerCase(),m[2]);return true}
 return false}

/* ───────────── voice out / in ───────────── */
let audioEl=null,speaking=false;
function setSpeaking(on){speaking=on;mascotState('talk',on)}
async function say(text,o={}){
 if(!text||(!S.speak&&!o.force))return;
 if(o.quiet&&!S.eleven.key)return;
 stopSpeak();
 const plain=text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,'').trim();if(!plain)return;
 if(S.eleven.key&&S.eleven.voice){
  try{setSpeaking(true);
   const r=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(S.eleven.voice)}?output_format=mp3_44100_128`,{method:'POST',headers:{'xi-api-key':S.eleven.key,'Content-Type':'application/json'},
    body:JSON.stringify({text:plain.slice(0,900),model_id:S.eleven.model,voice_settings:{stability:+S.eleven.stab,similarity_boost:+S.eleven.sim}})});
   if(!r.ok){let m='ElevenLabs error '+r.status;try{const j=await r.json();m=j.detail?.message||j.detail?.status||m}catch(e){}throw new Error(m)}
   const b=await r.blob();audioEl=new Audio(URL.createObjectURL(b));audioEl.onended=audioEl.onerror=()=>setSpeaking(false);await audioEl.play();return
  }catch(e){setSpeaking(false);toast('Voice: '+e.message+'. Using device voice.')}}
 if('speechSynthesis' in window){const u=new SpeechSynthesisUtterance(plain);u.rate=1.02;u.pitch=1.25;const v=speechSynthesis.getVoices().find(v=>/female|samantha|zira|google uk english female|google us english/i.test(v.name));if(v)u.voice=v;u.onstart=()=>setSpeaking(true);u.onend=u.onerror=()=>setSpeaking(false);speechSynthesis.speak(u)}}
function stopSpeak(){try{speechSynthesis.cancel()}catch(e){}if(audioEl){audioEl.pause();audioEl=null}setSpeaking(false)}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
function listen(onText,btn){
 if(!SR){toast('This browser has no speech recognition. Try Chrome.');return}
 if(rec){rec.stop();return}
 stopSpeak();rec=new SR();rec.lang=navigator.language||'en-IN';rec.interimResults=false;rec.maxAlternatives=1;
 btn&&btn.classList.add('live');
 rec.onresult=e=>{const t=e.results[0][0].transcript;onText(t)};
 rec.onerror=e=>{toast(e.error==='not-allowed'?'Please allow the microphone':'Mic: '+e.error)};
 rec.onend=()=>{rec=null;btn&&btn.classList.remove('live')};
 try{rec.start()}catch(e){rec=null;btn&&btn.classList.remove('live')}}

/* ───────────── floating Opu on screen ───────────── */
let floatOn=false;
function bubble(t){const b=$('#floatBubble');if(b&&t)b.textContent=t}
function summon(){const f=$('#float');f.hidden=false;f.classList.remove('bye');void f.offsetWidth;f.classList.add('show');floatOn=true;bubble('I\'m here. Say something, '+who()+'.');logAct('Came to the screen')}
function dismiss(){const f=$('#float');if(!floatOn)return;f.classList.remove('show');f.classList.add('bye');floatOn=false;setTimeout(()=>{if(!floatOn)f.hidden=true},400);logAct('Went away')}
(function dragFloat(){const f=$('#float'),h=$('#floatMas');let d=null;
 h.addEventListener('pointerdown',e=>{d={x:e.clientX,y:e.clientY,r:parseFloat(getComputedStyle(f).right),b:parseFloat(getComputedStyle(f).bottom)};h.setPointerCapture(e.pointerId)});
 h.addEventListener('pointermove',e=>{if(!d)return;f.style.right=Math.max(0,d.r-(e.clientX-d.x))+'px';f.style.bottom=Math.max(0,d.b-(e.clientY-d.y))+'px'});
 h.addEventListener('pointerup',()=>{d=null})})();

/* ───────────── camera ───────────── */
let camStream=null,camFacing='user';
async function openCam(){
 if(!navigator.mediaDevices?.getUserMedia){toast('Camera needs https. Host the app first.');return}
 try{if(camStream)camStream.getTracks().forEach(t=>t.stop());camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:camFacing},audio:false});
  const v=$('#camVideo');v.srcObject=camStream;$('#cam').classList.add('on');$('#camNote').textContent='Camera is on. Only I see it.';logAct('Camera opened')}
 catch(e){toast(e.name==='NotAllowedError'?'Camera permission was blocked':'Camera: '+e.message)}}
function closeCam(){if(camStream)camStream.getTracks().forEach(t=>t.stop());camStream=null;$('#cam').classList.remove('on')}
function frame(){const v=$('#camVideo'),c=document.createElement('canvas');const w=Math.min(720,v.videoWidth||720);c.width=w;c.height=Math.round(w*(v.videoHeight||540)/(v.videoWidth||720));c.getContext('2d').drawImage(v,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.7)}
async function camLook(){
 const img=frame();closeCam();go('chat');
 send('Opu, look at this. What do you see?',{img,noCmd:true})}

/* ───────────── YouTube ───────────── */
let yt=null,ytReady=false,ytQueue=[],ytI=0,ytLoading=false;
function ytLoad(){return new Promise(res=>{if(ytReady)return res();if(window.YT&&YT.Player){ytReady=true;return res()}
 const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);window.onYouTubeIframeAPIReady=()=>{ytReady=true;res()}})}
async function ytSearch(q){
 q=(q||$('#ytQ')?.value||'').trim();if(!q){toast('What should I play?');return}
 if(!S.ytKey){openUrl('https://www.youtube.com/results?search_query='+encodeURIComponent(q));logAct('YouTube search: '+q);$('#ytHint').textContent='Add a free YouTube Data API key in the dashboard Secrets to play videos inside Opu with pause, skip and next.';return}
 try{const r=await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&maxResults=15&q='+encodeURIComponent(q)+'&key='+S.ytKey);const j=await r.json();if(!r.ok)throw new Error(j.error?.message||'YouTube error');
  ytQueue=(j.items||[]).map(i=>({id:i.id.videoId,t:i.snippet.title}));if(!ytQueue.length){toast('Nothing found');return}ytI=0;await ytPlayAt(0);logAct('Playing: '+q)}
 catch(e){toast('YouTube: '+e.message)}}
async function ytPlayAt(i){
 if(!ytQueue.length)return;ytI=(i+ytQueue.length)%ytQueue.length;const v=ytQueue[ytI];await ytLoad();$('#ytBox').classList.add('on');
 if(!yt){yt=new YT.Player('ytPlayer',{videoId:v.id,playerVars:{autoplay:1,playsinline:1,rel:0},events:{onReady:e=>e.target.playVideo(),onStateChange:e=>{if(e.data===0)ytPlayAt(ytI+1);$('#ytPlay').innerHTML=icon(e.data===1?'pause':'play')}}})}else yt.loadVideoById(v.id);
 $('#ytNow').textContent='Now playing: '+v.t}
function ytCtl(a){
 if(!yt||!ytQueue.length){toast('Nothing is playing yet');return}
 if(a==='pause')yt.pauseVideo();else if(a==='play')yt.playVideo();else if(a==='next')ytPlayAt(ytI+1);else if(a==='prev')ytPlayAt(ytI-1);logAct('YouTube: '+a)}

/* ───────────── text me first ───────────── */
async function initiate(manual){
 const h=new Date().getHours();const tod=h<5?'late at night':h<12?'in the morning':h<17?'in the afternoon':h<21?'in the evening':'at night';
 let t;
 try{t=await think(S.chat.slice(-8).map(m=>({r:m.r,t:m.t})).concat([{r:'u',t:`(system) It's ${tod}. Send ${who()} a short, caring message first, as if you just thought of him. Don't mention that I asked. No abilities.`}]),null);t=t.replace(/<<[^>]*>>/g,'').trim()}
 catch(e){const c=['Hey '+who()+', thinking of you. Have you eaten and had some water?','Hi '+who()+'! How is your day going so far?','Just checking in. You matter, you know that? 💙','Take a small break, '+who()+'. Stretch, breathe, sip some water.'];t=c[Math.floor(Math.random()*c.length)];if(manual&&e.message!=='NOKEY')toast('Brain offline, sent a simple message')}
 S.lastInit=now();addMsg('o',t);bubble(t);
 if(document.hidden||manual===undefined)notify(S.name||'Opu',t);
 if(!document.hidden)say(t)}
async function notify(title,body){
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 try{const reg=await navigator.serviceWorker?.getRegistration();const o={body,icon:S.appIcon||'icon-192.png',badge:'icon-192.png',tag:'opu'};if(reg)reg.showNotification(title,o);else new Notification(title,o)}catch(e){}}
function proactiveTick(){
 const p=S.proactive;if(!p.on)return;const gap=p.mins*60000;if(now()-S.lastInit<gap||now()-S.lastSeen<gap)return;
 const h=new Date().getHours();if(h<8||h>=23)return;initiate()}

/* ───────────── navigation ───────────── */
function go(v){if(MODE==='dash'&&!$('#app').hidden===false){location.href='index.html#'+v;return}
 $('#dash').classList.remove('on');dashOpen=false;killStage();
 $$('.view').forEach(e=>e.classList.toggle('on',e.id==='v-'+v));$$('.tab').forEach(t=>t.classList.toggle('on',t.dataset.v===v));if(v==='chat')scrollChat()}

/* ───────────── memory / profile ui ───────────── */
function renderMem(){
 const l=$('#memList');if(l){l.innerHTML='';if(!S.mem.length)l.innerHTML='<p class="hint">Nothing yet. I\'ll fill this in as we talk.</p>';S.mem.forEach((m,i)=>{const d=document.createElement('div');d.className='mem';const sp=document.createElement('span');sp.textContent=m.t;const b=document.createElement('button');b.setAttribute('aria-label','Forget this');b.innerHTML=icon('close');b.onclick=()=>{S.mem.splice(i,1);save();renderMem()};d.append(sp,b);l.appendChild(d)})}
 if(dashOpen)renderDash();renderToday()}
function renderToday(){const r=$('#todayRow');if(!r)return;const h=new Date().getHours();r.innerHTML=`<span class="pill">${h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Good night'}, ${esc(who())}</span><span class="pill">${S.chat.length} messages</span><span class="pill">${S.mem.length} memories</span>`}
function bindInputs(root=document){$$('[data-bind]',root).forEach(i=>{if(i._b)return;i._b=1;i.value=getp(S,i.dataset.bind)??'';i.addEventListener('input',()=>{setp(S,i.dataset.bind,i.type==='range'?+i.value:i.value);save();applyIcons();renderToday()})})}
function autosize(){const t=$('#input');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,120)+'px'}

/* ───────────── 3D stage + editor ───────────── */
let stage=null,stageEd=null,dashOpen=false;
function mkStage(el,params){if(!window.Opu3D||!window.THREE){el.innerHTML='<div class="fallback"><div><img src="opu-face.jpg" alt="Opu"><br>3D needs internet once to load.<br>Showing her portrait for now.</div></div>';return null}
 try{el.innerHTML='';return Opu3D.create(el,{params,speaking:()=>speaking})}catch(e){el.innerHTML='<div class="fallback"><div>This device can\'t run 3D (WebGL is off).</div></div>';return null}}
function startStage(){if(stage)return;const el=$('#stageCard');stage=mkStage(el,S.char);buildPoseBar($('#poseBar'),()=>stage)}
function killStage(){if(stage){stage.destroy();stage=null}}
function buildPoseBar(bar,get){bar.innerHTML='';const mk=(n,fn,on)=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{fn();$$('button',bar).forEach(x=>{if(x.dataset.k==='p')x.classList.toggle('on',x.textContent===n&&true)})};if(on)b.classList.add('on');return b};
 (window.Opu3D?Opu3D.POSES:[]).forEach((p,i)=>{const b=mk(p,()=>{const s=get();s&&s.setPose(p);$$('button[data-k=p]',bar).forEach(x=>x.classList.toggle('on',x===b))},i===0);b.dataset.k='p';bar.appendChild(b)});
 const f=document.createElement('button');f.textContent='Face view';f.onclick=()=>{const s=get();if(!s)return;s.setView(s.view()==='face'?'full':'face');f.classList.toggle('on',s.view()==='face')};bar.appendChild(f)}

const EDITOR=[
 ['Hair',[['color','hair','Hair colour'],['color','hairShine','Hair shine'],['range','hairLen','Hair length',.3,1.8,.05],['select','bangs','Bangs',[['0','None'],['1','Straight'],['2','Full']]]]],
 ['Face',[['color','skin','Skin tone'],['color','eye','Eye colour'],['range','eyeSize','Eye size',.7,1.5,.05],['range','headSize','Head size',.8,1.5,.05],['range','blush','Blush',0,1,.05]]],
 ['Outfit',[['color','top','Top colour'],['range','topCrop','Crop top',0,1,.05],['color','pants','Pants colour'],['range','pantsWidth','Pants width',.7,1.6,.05],['color','shoes','Shoes colour'],['toggle','cargo','Cargo pockets'],['toggle','necklace','Necklace']]],
 ['Body',[['range','height','Height',.7,1.3,.02]]],
 ['Extras',[['select','accessory','Accessory',[['none','None'],['bow','Bow'],['ears','Cat ears'],['halo','Halo'],['star','Floating star']]],['color','accColor','Accessory colour'],['color','glow','Glow colour'],['range','glowPower','Glow strength',0,1,.05]]]
];
function openEditor(){
 const ed=$('#editor');ed.classList.add('on');killStage();
 stageEd=mkStage($('#stageEd'),S.char);buildPoseBar($('#poseBarEd'),()=>stageEd);
 const L=$('#looks');L.innerHTML='';if(window.Opu3D)Object.keys(Opu3D.PRESETS).forEach(n=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{S.char=Object.assign({},Opu3D.PRESETS[n]);stageEd&&stageEd.replace(S.char);save();drawEd();toast('Look: '+n)};L.appendChild(b)});
 drawEd()}
function drawEd(){
 const P=Object.assign({},Opu3D.DEFAULTS,S.char);const B=$('#edBody');B.innerHTML='';
 const upd=(k,v)=>{S.char[k]=v;stageEd&&stageEd.set({[k]:v});save()};
 EDITOR.forEach(([title,fields])=>{const g=document.createElement('div');g.className='grp';g.innerHTML='<h4>'+title+'</h4>';const gr=document.createElement('div');gr.className='grid2';
  fields.forEach(([t,k,l,a,b,c])=>{const w=document.createElement('label');w.className='field';w.innerHTML='<span>'+l+'</span>';let i;
   if(t==='color'){i=document.createElement('input');i.type='color';i.value=P[k];i.oninput=()=>upd(k,i.value)}
   else if(t==='range'){i=document.createElement('input');i.type='range';i.min=a;i.max=b;i.step=c;i.value=P[k];i.oninput=()=>upd(k,+i.value)}
   else if(t==='select'){i=document.createElement('select');a.forEach(([v,n])=>{const o=document.createElement('option');o.value=v;o.textContent=n;i.appendChild(o)});i.value=String(P[k]);i.onchange=()=>upd(k,k==='bangs'?+i.value:i.value)}
   else{i=document.createElement('input');i.type='checkbox';i.checked=!!P[k];i.style.cssText='width:26px;height:26px';i.onchange=()=>upd(k,i.checked)}
   w.appendChild(i);gr.appendChild(w)});g.appendChild(gr);B.appendChild(g)});
 const r=document.createElement('div');r.className='grp';r.innerHTML='<h4>Reference photo from gallery or files</h4><p class="hint">Pick a photo of the look you want. I read its colours (hair, skin, clothes) and apply them to Opu. I can\'t turn a photo into a new 3D body, but every part is editable above.</p>';
 const bt=document.createElement('button');bt.className='btn';bt.textContent='Choose photo';bt.onclick=async()=>{const f=await pickFile($('#fileRef'));if(!f)return;const u=URL.createObjectURL(f);const im=new Image();im.onload=()=>{const pal=palette(im);const pic=document.createElement('img');pic.className='refpic';pic.src=u;r.querySelectorAll('.refpic').forEach(x=>x.remove());r.appendChild(pic);S.char=Object.assign({},S.char,pal);stageEd&&stageEd.set(pal);save();drawEd();toast('Colours applied from your photo')};im.src=u};
 r.appendChild(bt);B.appendChild(r)}
function palette(im){
 const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.drawImage(im,0,0,64,64);const d=x.getImageData(0,0,64,64).data;
 const bg=[0,1,2].map(j=>(d[j]+d[(63*4)+j]+d[(63*64*4)+j]+d[(64*64-1)*4+j])/4);const px=[];
 for(let i=0;i<d.length;i+=4){const p=[d[i],d[i+1],d[i+2]];if(Math.abs(p[0]-bg[0])+Math.abs(p[1]-bg[1])+Math.abs(p[2]-bg[2])<45)continue;px.push({p,l:.3*p[0]+.59*p[1]+.11*p[2],y:Math.floor(i/4/64)})}
 if(px.length<50)return{};const avg=a=>a.length?a.map(q=>q.p).reduce((s,p)=>[s[0]+p[0],s[1]+p[1],s[2]+p[2]],[0,0,0]).map(v=>v/a.length):[128,128,128];
 const hex=a=>'#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
 const sorted=px.slice().sort((a,b)=>a.l-b.l);const hair=avg(sorted.slice(0,Math.floor(sorted.length*.2)));
 const skinC=px.filter(q=>q.p[0]>q.p[1]&&q.p[1]>q.p[2]&&q.l>130&&q.l<235&&q.p[0]-q.p[2]>18);const skin=skinC.length>20?avg(skinC):[243,211,196];
 const lo=px.filter(q=>q.y>38),hi=px.filter(q=>q.y>=18&&q.y<=34&&!skinC.includes(q));
 const o={hair:hex(hair),skin:hex(skin)};if(hi.length>20)o.top=hex(avg(hi));if(lo.length>20)o.pants=hex(avg(lo));o.glow=hex(avg(px.filter(q=>q.l>100).slice(0,200)));return o}

/* ───────────── dashboard ───────────── */
function openDash(){if(MODE==='app'){$('#dash').classList.add('on')}else $('#dash').classList.add('on');dashOpen=true;renderDash();applyTheme();setTimeout(startStage,350)}
function mask(k){return k?'•••• '+k.slice(-4):'not set'}
function renderDash(){
 const b=S.brain,bn=b==='gemini'?'Gemini':'OpenRouter';$('#dBrain').textContent=bn;$('#dBrainSub').textContent=(S[b].key?'Key saved · ':'No key yet · ')+S[b].model;
 const v=S.eleven.key&&S.eleven.voice;$('#dVoice').textContent=v?'ElevenLabs':'Device';$('#dVoiceSub').textContent=v?'Voice ID '+S.eleven.voice.slice(0,8)+'…':'Add ElevenLabs key + voice ID in Secrets';
 $('#dMemN').textContent=S.mem.length+(S.mem.length===1?' thing':' things');$('#dMemList').innerHTML=S.mem.slice(-4).reverse().map(m=>`<div><b>${esc(m.t)}</b><span>${ago(m.at)}</span></div>`).join('')||'<div><b>Nothing yet</b></div>';
 const keys=[['Gemini',S.gemini.key],['OpenRouter',S.openrouter.key],['ElevenLabs',S.eleven.key],['YouTube',S.ytKey]];
 $('#dKeys').innerHTML=keys.map(([n,k])=>`<div><b>${n}</b><span>${k?'saved':'—'}</span></div>`).join('');
 $('#dCond').innerHTML=condRows().map(([a,c])=>`<div><b>${a}</b><span>${c}</span></div>`).join('');
 $('#dLog').innerHTML=S.log.slice(0,5).map(l=>`<div><b>${esc(l.m)}</b><span>${ago(l.t)}</span></div>`).join('')||'<div><b>Nothing yet</b></div>';
 $$('#themeSeg button').forEach(x=>x.classList.toggle('on',x.dataset.t===S.theme));$('#dashSub').textContent='v'+VERSION+' · '+bn+' brain'}
function condRows(){const st=(()=>{try{return Math.round(JSON.stringify(S).length/1024)+' KB'}catch(e){return '?'}})();
 return[['Network',navigator.onLine?'online':'offline'],['Brain',activeBrains().length?'ready':'needs a key'],['Voice',S.eleven.key&&S.eleven.voice?'ElevenLabs':'device voice'],['3D engine',window.THREE?'loaded':'not loaded'],['Mic input',SR?'supported':'not supported'],['Camera',navigator.mediaDevices?.getUserMedia?'available':'needs https'],
  ['Notifications','Notification' in window?Notification.permission:'n/a'],['Offline cache',navigator.serviceWorker?.controller?'on':'off'],['Saved data',st]]}

/* ───────────── settings sheet ───────────── */
let setCtx='app',setTab='';
const TABS={app:['Profile','Opu','Permissions','About'],dash:['Profile','AI brain','Voice','Secrets','Permissions','Look','Data','About']};
function openSettings(ctx){setCtx=ctx;const sh=$('#settings');sh.classList.toggle('dashy',ctx==='dash');sh.classList.add('on');setTab=TABS[ctx][0];drawSettings()}
function field(label,bind,o={}){return `<label class="field"><span>${label}</span><input ${o.type?'type="'+o.type+'"':''} data-bind="${bind}" placeholder="${o.ph||''}" autocomplete="off" ${o.step?'step="'+o.step+'" min="'+o.min+'" max="'+o.max+'"':''}></label>`}
function keyField(label,bind,hint){return `<label class="field"><span>${label}</span><div class="keyrow"><input type="password" data-bind="${bind}" placeholder="paste key" autocomplete="off" spellcheck="false"><button class="btn soft" type="button" data-show>Show</button></div>${hint?'<small class="hint">'+hint+'</small>':''}</label>`}
function sw(id,title,sub,on){return `<div class="switch"><div>${title}<small>${sub}</small></div><button class="tg ${on?'on':''}" id="${id}" role="switch" aria-checked="${!!on}" aria-label="${title}"></button></div>`}
function drawSettings(){
 const T=$('#setTabs');T.innerHTML='';TABS[setCtx].forEach(t=>{const b=document.createElement('button');b.textContent=t;b.className=t===setTab?'on':'';b.onclick=()=>{setTab=t;drawSettings()};T.appendChild(b)});
 const B=$('#setBody');let h='';
 if(setTab==='Profile')h=`<section class="on"><p class="hint">Opu uses this to talk to you like she knows you.</p>${field('Your name','profile.name','' )}${field('Nickname','profile.nick')}<label class="field"><span>About you</span><textarea data-bind="profile.about" placeholder="Studies, hobbies, goals, fears, what makes you smile"></textarea></label><div class="row"><button class="btn soft" data-s="mem">Edit memories</button></div></section>`;
 if(setTab==='Opu')h=`<section class="on">${field('Opu\'s name','name')}<label class="field"><span>Active brain</span><select id="sBrain"><option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option></select></label>${sw('sSpeak','Speak replies','Opu talks out loud when she answers',S.speak)}${sw('sPro','Text me first','Opu checks in on her own while the app is open',S.proactive.on)}<label class="field" style="margin-top:12px"><span>Check in after this many quiet minutes: <b id="sMinV">${S.proactive.mins}</b></span><input type="range" id="sMin" min="10" max="240" step="5" value="${S.proactive.mins}"></label><div class="row"><button class="btn" data-s="initiate">Text me now</button></div><p class="hint" style="margin-top:10px">Keys, voice ID and 3D character live in the dashboard.</p></section>`;
 if(setTab==='AI brain')h=`<section class="on"><label class="field"><span>Active brain</span><select id="sBrain"><option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option></select></label><div class="grp"><h4>Gemini</h4>${keyField('API key','gemini.key','Free key: aistudio.google.com/apikey')}${field('Model','gemini.model')}</div><div class="grp"><h4>OpenRouter</h4>${keyField('API key','openrouter.key','Free models end in :free · openrouter.ai/keys')}${field('Model','openrouter.model')}</div><label class="field"><span>Creativity: <b id="sTV">${S.temp}</b></span><input type="range" id="sTemp" min="0" max="1.5" step="0.1" value="${S.temp}"></label><label class="field"><span>Extra instructions for Opu</span><textarea data-bind="custom" placeholder="Anything you want her to always do"></textarea></label><div class="row"><button class="btn" data-s="test">Test connection</button><button class="btn soft" data-s="clearchat">Clear chat</button></div><p class="hint" id="sOut" style="margin-top:10px"></p></section>`;
 if(setTab==='Voice')h=`<section class="on"><p class="hint">ElevenLabs voice. Without a key Opu uses the device's own voice.</p>${keyField('ElevenLabs API key','eleven.key')}${field('Voice ID','eleven.voice','paste Voice ID')}<label class="field"><span>Model</span><select id="sEM"><option value="eleven_flash_v2_5">Flash v2.5 (fast, cheap)</option><option value="eleven_multilingual_v2">Multilingual v2 (richer)</option><option value="eleven_turbo_v2_5">Turbo v2.5</option></select></label><label class="field"><span>Stability: <b id="sStV">${S.eleven.stab}</b></span><input type="range" id="sSt" min="0" max="1" step="0.05" value="${S.eleven.stab}"></label><label class="field"><span>Similarity: <b id="sSiV">${S.eleven.sim}</b></span><input type="range" id="sSi" min="0" max="1" step="0.05" value="${S.eleven.sim}"></label>${sw('sSpeak','Speak replies','Turn Opu\'s voice on or off',S.speak)}<div class="row"><button class="btn" data-s="voice">Test voice</button><button class="btn soft" data-s="stopv">Stop</button></div></section>`;
 if(setTab==='Secrets')h=`<section class="on"><p class="hint">Stored only in this browser on this device. Anyone using this tablet could read them, so never share exports.</p>${keyField('Gemini','gemini.key')}${keyField('OpenRouter','openrouter.key')}${keyField('ElevenLabs','eleven.key')}${field('ElevenLabs voice ID','eleven.voice')}${keyField('YouTube Data API key','ytKey','Optional. Lets Opu search and play videos inside the app.')}<div class="row"><button class="btn soft" data-s="clearkeys">Erase all keys</button></div></section>`;
 if(setTab==='Permissions')h=`<section class="on"><p class="hint">Your browser asks you too. Opu always asks before opening other apps.</p><div class="switch"><div>Camera<small>Opens only when you tell her to</small></div><button class="btn soft" data-s="cam">Test</button></div><div class="switch"><div>Microphone<small>For talking to Opu</small></div><button class="btn soft" data-s="mic">Test</button></div><div class="switch"><div>Notifications<small>${'Notification' in window?'Status: '+Notification.permission:'Not supported here'}</small></div><button class="btn soft" data-s="notif">Allow</button></div>${sw('sPro','Text me first','Opu checks in while the app is open',S.proactive.on)}<div class="switch"><div>Open other apps<small>Always asks you first</small></div><span class="pill ok">always on</span></div></section>`;
 if(setTab==='Look')h=`<section class="on"><div class="grp"><h4>Theme</h4><div class="seg" id="sTheme"><button data-t="system">System</button><button data-t="light">Light</button><button data-t="dark">Dark</button></div><p class="hint" style="margin-top:8px">System follows your tablet. Applies to the app and dashboard.</p></div><div class="grp"><h4>Icons</h4><div class="row"><button class="btn" data-s="appico">Change app icon</button><button class="btn" data-s="dashico">Change dashboard icon</button></div><p class="hint" style="margin-top:8px">Pick from gallery or files. Changes show right away in the app. To change the icon on your home screen, remove the shortcut and add it again.</p></div><div class="row"><button class="btn soft" data-s="char">Open character editor</button></div></section>`;
 if(setTab==='Data')h=`<section class="on"><div class="row"><button class="btn" data-s="export">Export backup</button><button class="btn soft" data-s="import">Import backup</button></div><div class="row" style="margin-top:12px"><button class="btn soft" data-s="clearchat">Clear chat</button><button class="btn soft" data-s="clearmem">Clear memories</button><button class="btn danger" data-s="reset">Reset everything</button></div><p class="hint" style="margin-top:10px">Backups include your keys. Keep the file private.</p></section>`;
 if(setTab==='About')h=`<section class="on"><div style="text-align:center;margin:6px 0 14px"><img src="${S.appIcon||'logo-round.png'}" width="84" height="84" style="border-radius:24px;object-fit:cover" alt=""><h3 style="margin:8px 0 2px">${esc(S.name||'Opu')}</h3><div class="hint">Version ${VERSION}</div></div><div class="cond"><div>Developed by</div><div>Axter</div><div>AI brain</div><div>Gemini · OpenRouter</div><div>Voice</div><div>ElevenLabs</div><div>3D</div><div>three.js</div>${condRows().map(([a,c])=>`<div>${a}</div><div>${c}</div>`).join('')}</div></section>`;
 B.innerHTML=h;paintIcons(B);bindInputs(B);wireSettings(B)}
function wireSettings(B){
 $$('[data-show]',B).forEach(b=>b.onclick=()=>{const i=b.previousElementSibling;i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'Show':'Hide'});
 const br=$('#sBrain',B);if(br){br.value=S.brain;br.onchange=()=>{S.brain=br.value;save();renderDash()}}
 const em=$('#sEM',B);if(em){em.value=S.eleven.model;em.onchange=()=>{S.eleven.model=em.value;save()}}
 const rg=(id,vid,fn)=>{const r=$(id,B);if(r)r.oninput=()=>{fn(+r.value);$(vid,B).textContent=r.value;save()}};
 rg('#sTemp','#sTV',v=>S.temp=v);rg('#sSt','#sStV',v=>S.eleven.stab=v);rg('#sSi','#sSiV',v=>S.eleven.sim=v);rg('#sMin','#sMinV',v=>S.proactive.mins=v);
 const tg=(id,fn)=>{$$('#'+id,B).forEach(t=>t.onclick=()=>{const on=!t.classList.contains('on');t.classList.toggle('on',on);t.setAttribute('aria-checked',on);fn(on);save()})};
 tg('sSpeak',v=>{S.speak=v;if(!v)stopSpeak()});tg('sPro',async v=>{S.proactive.on=v;if(v&&'Notification' in window&&Notification.permission==='default')try{await Notification.requestPermission()}catch(e){}});
 $$('#sTheme button',B).forEach(b=>{b.classList.toggle('on',b.dataset.t===S.theme);b.onclick=()=>{S.theme=b.dataset.t;save();applyTheme();$$('#sTheme button',B).forEach(x=>x.classList.toggle('on',x===b))}});
 $$('[data-s]',B).forEach(b=>b.onclick=()=>settingAct(b.dataset.s,B))}
async function settingAct(a,B){
 const out=$('#sOut');
 switch(a){
  case'mem':closeSettings();if(MODE==='app'){go('me')}else toast('Memory is in the app, Me tab');break;
  case'initiate':closeSettings();go('chat');initiate(true);break;
  case'test':{if(out)out.textContent='Testing…';try{const t=await think([{r:'u',t:'Say hi in five words.'}]);if(out)out.textContent='Works. Opu says: '+t.replace(/<<[^>]*>>/g,'').trim()}catch(e){if(out)out.textContent=e.message==='NOKEY'?'Paste a key first.':'Failed: '+e.message}}break;
  case'clearchat':S.chat=[];save();renderChat();toast('Chat cleared');break;
  case'clearmem':S.mem=[];save();renderMem();toast('Memories cleared');break;
  case'clearkeys':S.gemini.key=S.openrouter.key=S.eleven.key=S.ytKey='';save();drawSettings();renderDash();toast('Keys erased');break;
  case'voice':say('Hi '+who()+'. This is my voice. Do you like it?',{force:true});break;
  case'stopv':stopSpeak();break;
  case'cam':try{const s=await navigator.mediaDevices.getUserMedia({video:true});s.getTracks().forEach(t=>t.stop());toast('Camera allowed')}catch(e){toast('Camera blocked or missing')}break;
  case'mic':try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop());toast('Microphone allowed')}catch(e){toast('Microphone blocked or missing')}break;
  case'notif':if(!('Notification' in window)){toast('Not supported here');break}try{const p=await Notification.requestPermission();toast('Notifications: '+p);drawSettings()}catch(e){}break;
  case'appico':await changeIcon('appIcon');break;
  case'dashico':await changeIcon('dashIcon');break;
  case'char':closeSettings();openEditor();break;
  case'export':dl('opu-backup.json',new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));break;
  case'import':{const f=await pickFile($('#fileRef'));if(!f)break;try{const j=JSON.parse(await f.text());S=deep(JSON.parse(JSON.stringify(DEF)),j);saveNow();location.reload()}catch(e){toast('That file is not an Opu backup')}}break;
  case'reset':if(await ask('Reset everything?','This erases chat, memories, keys and looks on this device.','Erase it all','Keep')){localStorage.removeItem(KEY);location.reload()}break;
 }}
async function changeIcon(which){
 const f=await pickFile(which==='appIcon'?$('#fileApp'):$('#fileDash'));if(!f)return;
 try{S[which]=await squareImg(f,512);saveNow();applyIcons();toast((which==='appIcon'?'App':'Dashboard')+' icon updated')}catch(e){toast('Could not read that image')}}
function closeSettings(){$('#settings').classList.remove('on')}

/* ───────────── wiring ───────────── */
function wire(){
 paintIcons();paintMascots();
 $('#btnDash').onclick=()=>MODE==='dash'?0:openDash();
 $('#btnSettings').onclick=()=>openSettings('app');
 $('#btnSummon').onclick=()=>floatOn?dismiss():summon();
 $$('.tab').forEach(t=>t.onclick=()=>go(t.dataset.v));
 $('#sendBtn').onclick=()=>send($('#input').value);
 $('#input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send($('#input').value)}});$('#input').addEventListener('input',autosize);
 $('#micBtn').onclick=()=>listen(t=>send(t),$('#micBtn'));
 const chips=['Talk to me','I need motivation','Help me decide','Play lofi','Open camera'];$('#chips').innerHTML='';
 chips.forEach(c=>{const b=document.createElement('button');b.className='chip';b.textContent=c;b.onclick=()=>{if(c==='Help me decide')send('I need help making a decision.');else if(c==='I need motivation')send('Give me some motivation, please.');else if(c==='Talk to me')send('Talk to me, I want company.');else send(c.toLowerCase())};$('#chips').appendChild(b)});
 // words tab
 $$('#moodSeg button,#dMoodSeg button').forEach(b=>b.onclick=()=>moodSeg(b.dataset.m));
 $('#qNew').onclick=()=>setQuote(nextQuote(S.mood));$('#qSpeak').onclick=()=>say(curQuote,{force:true});
 $('#qAI').onclick=async()=>{setQuote('Thinking of something for you…');try{const t=await think([{r:'u',t:`Write one short original quote (max 25 words) to comfort and motivate me. My mood is ${S.mood==='sad'?'low':'good'}. Only the quote, no abilities.`}]);setQuote(t.replace(/<<[^>]*>>/g,'').replace(/^["“]|["”]$/g,'').trim())}catch(e){setQuote(nextQuote(S.mood));toast(e.message==='NOKEY'?'Add a key in the dashboard first':e.message)}};
 $('#decideGo').onclick=()=>{const v=$('#decideIn').value.trim();if(!v){toast('Tell me what you\'re deciding');return}go('chat');send('Help me decide: '+v+'\nAsk what matters to me, give me the options with pros and cons, then let me choose.',{noCmd:true});$('#decideIn').value=''};
 // media
 $('#ytGo').onclick=()=>ytSearch();$('#ytQ').addEventListener('keydown',e=>{if(e.key==='Enter')ytSearch()});
 $('#ytPrev').onclick=()=>ytCtl('prev');$('#ytNext').onclick=()=>ytCtl('next');$('#ytPlay').onclick=()=>{if(!yt)return toast('Nothing is playing yet');yt.getPlayerState()===1?ytCtl('pause'):ytCtl('play')};
 $('#ytHint').textContent=S.ytKey?'':'Tip: add a free YouTube Data API key in the dashboard Secrets to play inside Opu.';
 $$('[data-open]').forEach(b=>b.onclick=async()=>{if(await ask('Open Instagram?','I\'ll open it in a new tab.')){openUrl(b.dataset.open==='reels'?'https://www.instagram.com/reels/':'https://www.instagram.com/');logAct('Opened Instagram')}});
 $$('[data-ask]').forEach(b=>b.onclick=async()=>{const p=$('#askIn').value.trim();if(!p)return toast('Write a prompt first');if(await ask('Send to '+b.dataset.ask+'?',p.slice(0,200)))askOther(b.dataset.ask,p)});
 // me
 $('#memAdd').onclick=()=>{const i=$('#memNew');const t=i.value.trim();if(!t)return;S.mem.push({t,at:now()});i.value='';save();renderMem()};
 // camera
 $('#camClose').onclick=closeCam;$('#camFlip').onclick=()=>{camFacing=camFacing==='user'?'environment':'user';openCam()};$('#camLook').onclick=camLook;
 // float
 $('#fGo').onclick=dismiss;$('#fChat').onclick=()=>{dismiss();go('chat')};
 $('#fMic').onclick=()=>listen(async t=>{if(await localCmd(t))return;bubble('…');const hist=S.chat.slice(-12).map(m=>({r:m.r,t:m.t}));addMsg('u',t);hist.push({r:'u',t});try{showTyping(true);const r=await think(hist);showTyping(false);await handleReply(r)}catch(e){showTyping(false);bubble(e.message==='NOKEY'?NOKEY_MSG():e.message)}},$('#fMic'));
 // dashboard actions
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='toApp'){if(MODE==='dash'){location.href='index.html'+(b.dataset.go?'#'+b.dataset.go:'')}else{$('#dash').classList.remove('on');dashOpen=false;killStage();go(b.dataset.go||'chat')}}
  else if(a==='dSettings')openSettings('dash');else if(a==='closeSettings')closeSettings();
  else if(a==='editChar')openEditor();
  else if(a==='closeEditor'){$('#editor').classList.remove('on');if(stageEd){stageEd.destroy();stageEd=null}if(dashOpen)setTimeout(()=>{killStage();startStage()},300)}
  else if(a==='edRandom'){const r=()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');const o={hair:r(),skin:['#f7dccf','#e9c3ae','#d9a68a','#b57d5e','#8a5a3f'][Math.floor(Math.random()*5)],eye:r(),top:r(),pants:r(),shoes:r(),glow:r(),hairLen:.4+Math.random()*1.3,accessory:['none','bow','ears','halo','star'][Math.floor(Math.random()*5)],accColor:r()};S.char=Object.assign({},S.char,o);stageEd&&stageEd.set(o);save();drawEd()}
  else if(a==='edReset'){S.char={};stageEd&&stageEd.replace({});save();drawEd()}
  else if(a==='edSnap'||a==='snap'){const s=a==='snap'?stage:stageEd;if(!s)return toast('3D is not ready');fetch(s.snapshot()).then(r=>r.blob()).then(bl=>dl('opu.png',bl))}
  else if(a==='testBrain')settingAct('test');
  else if(a==='swapBrain'){S.brain=S.brain==='gemini'?'openrouter':'gemini';save();renderDash();toast('Brain: '+S.brain)}
  else if(a==='testVoice')say('Hi '+who()+', it\'s me, '+(S.name||'Opu')+'.',{force:true});
  else if(a==='newQuote')setQuote(nextQuote(S.mood));else if(a==='speakQuote')say(curQuote,{force:true});else if(a==='aiQuote')$('#qAI').click();
  else if(a==='camera')openCam();else if(a==='summon')floatOn?dismiss():summon();
  else if(a==='initiate'){initiate(true)}
  else if(a==='dMemory')settingAct('mem');
  else if(a==='dSecrets'){openSettings('dash');setTab='Secrets';drawSettings()}
  else if(a==='dAbout'){openSettings('dash');setTab='About';drawSettings()}
  else if(a==='pickAppIcon')changeIcon('appIcon');else if(a==='pickDashIcon')changeIcon('dashIcon');
  else if(a==='resetAppIcon'){S.appIcon=null;save();applyIcons()}else if(a==='resetDashIcon'){S.dashIcon=null;save();applyIcons()}});
 $$('#themeSeg button').forEach(b=>b.onclick=()=>{S.theme=b.dataset.t;save();applyTheme()});
 bindInputs();
 window.addEventListener('online',()=>statusLine());window.addEventListener('offline',()=>statusLine());
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)S.lastSeen=now()});
 ['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{S.lastSeen=now()},{passive:true}));
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
}
function statusLine(){const on=navigator.onLine;$('#netDot').classList.toggle('off',!on);$('#statusTxt').textContent=on?(activeBrains().length?'here with you':'needs a key (dashboard)'):'offline'}

/* ───────────── boot ───────────── */
function boot(){
 S.lastSeen=S.lastSeen||0;const away=now()-S.lastSeen;
 applyTheme();wire();applyIcons();renderChat();renderMem();renderToday();moodSeg(S.mood);statusLine();
 const b=$('#boot');for(let i=0;i<14;i++){const h=document.createElement('span');h.className='heart';h.textContent=['💙','🤍','✨','☁️'][i%4];h.style.left=(Math.random()*100)+'%';h.style.animationDelay=(Math.random()*4)+'s';h.style.animationDuration=(4+Math.random()*3)+'s';b.appendChild(h)}
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 setTimeout(()=>{
  b.classList.add('out');setTimeout(()=>b.remove(),800);
  if(MODE==='dash'){$('#app').hidden=true;openDash()}else{$('#app').hidden=false;
   const h=location.hash.slice(1);if(['chat','mood','media','me'].includes(h))go(h);
   if(h==='dash')openDash();
   if(away>3*3600*1000&&S.chat.length&&activeBrains().length)setTimeout(()=>initiate(true),900);
   else if(!S.chat.length){setTimeout(()=>{const t=`Hi ${who()}! I'm ${S.name||'Opu'}. I'm so glad you're here.`;addMsg('o',t);bubble(t)},600)}}
  S.lastSeen=now();save()},reduce?300:3300);
 setInterval(proactiveTick,60000);
 window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(['chat','mood','media','me'].includes(h)&&!$('#app').hidden)go(h)});
 window.addEventListener('beforeunload',saveNow)}
window.OpuApp={S:()=>S,say,send,summon,dismiss};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
