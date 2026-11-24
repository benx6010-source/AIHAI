/* Opu 3D — a procedural, fully editable character built from primitives (three.js r128).
   Every part is driven by a parameter object, so "edit / replace / animate / recreate" all work live. */
(function(){
'use strict';

const DEFAULTS = {
  skin:'#f3d3c4', hair:'#0c0b10', hairShine:'#3a3550', eye:'#3a2418',
  top:'#d9d6d8', pants:'#2a2a2e', shoes:'#e9e4df', glow:'#8fd0ff',
  height:1.0, headSize:1.0, hairLen:1.15, bangs:1, eyeSize:1.0, pantsWidth:1.0, topCrop:0.0,
  blush:0.6, glowPower:0.6,
  accessory:'none', accColor:'#ff7fa8',
  necklace:true, cargo:true
};

const PRESETS = {
  'Opu (reference)': {},
  'Cloud Opu':   {skin:'#fbe3d6',hair:'#6aa9ff',hairShine:'#d3e8ff',eye:'#1f2f5a',top:'#ffffff',pants:'#8cc4ff',shoes:'#ffffff',glow:'#9bd0ff',hairLen:0.9,accessory:'halo',accColor:'#ffffff',cargo:false},
  'Sakura':      {skin:'#f7dccf',hair:'#f08fb4',hairShine:'#ffd0e2',eye:'#7a2a4a',top:'#fff1f6',pants:'#3b2f45',shoes:'#ffd6e4',glow:'#ff9fc4',hairLen:1.3,accessory:'bow',accColor:'#ff5a8a'},
  'Midnight':    {skin:'#e9c3ae',hair:'#17143a',hairShine:'#6a63c9',eye:'#8b7bff',top:'#1c1c26',pants:'#0e0e14',shoes:'#2a2a38',glow:'#9a8cff',hairLen:1.45,accessory:'ears',accColor:'#6a63c9'},
  'Sunny':       {skin:'#d9a68a',hair:'#3a1f12',hairShine:'#a0623a',eye:'#2a1a10',top:'#ffd45e',pants:'#3a5a8a',shoes:'#ffffff',glow:'#ffd67a',hairLen:0.7,accessory:'none'}
};

const POSES = ['Idle','Wave','Dance','Think','Shy'];

function mix(a,b,t){return a+(b-a)*t}
const ease = t => t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

function create(container, opts){
  opts = opts||{};
  if(!window.THREE) return null;
  const T = window.THREE;
  let P = Object.assign({}, DEFAULTS, opts.params||{});
  const renderer = new T.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  container.appendChild(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(28, 1, .1, 100);
  scene.add(new T.HemisphereLight(0xffffff, 0x8a8aa0, .95));
  const key = new T.DirectionalLight(0xffffff, .9); key.position.set(2.5,5,5); scene.add(key);
  const rim = new T.DirectionalLight(0xffffff, 1.1); rim.position.set(-4,3,-4); scene.add(rim);
  const rimFill = new T.PointLight(0xffffff, .0, 14); rimFill.position.set(0,2,2.5); scene.add(rimFill);

  // soft ground shadow
  const sc = document.createElement('canvas'); sc.width=sc.height=128;
  const sx = sc.getContext('2d'); const g = sx.createRadialGradient(64,64,4,64,64,62);
  g.addColorStop(0,'rgba(0,0,0,.45)'); g.addColorStop(1,'rgba(0,0,0,0)'); sx.fillStyle=g; sx.fillRect(0,0,128,128);
  const shadow = new T.Mesh(new T.PlaneGeometry(2.4,2.4), new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false}));
  shadow.rotation.x = -Math.PI/2; shadow.position.y = .01; scene.add(shadow);

  let root = new T.Group(); scene.add(root);
  let parts = {};
  let pose = 'Idle', poseT = 0, view = 'full', viewK = 0, spin = {y:0, vy:0, dragging:false, auto:true};
  let t0 = performance.now(), blinkAt = 2.5, running = true, raf = 0;

  const mat = (c, o) => new T.MeshStandardMaterial(Object.assign({color:c, roughness:.55, metalness:.02}, o||{}));
  function sph(r, m, sx, sy, sz){ const s = new T.Mesh(new T.SphereGeometry(r,32,24), m); s.scale.set(sx||1, sy||1, sz||1); return s; }
  function limb(r1, r2, len, m){ // tapered capsule
    const g = new T.Group();
    const c = new T.Mesh(new T.CylinderGeometry(r1,r2,len,24), m); c.position.y = -len/2; g.add(c);
    const a = sph(r1,m); g.add(a); const b = sph(r2,m); b.position.y = -len; g.add(b);
    return g;
  }

  function build(){
    scene.remove(root);
    root.traverse(o=>{ if(o.geometry) o.geometry.dispose(); });
    root = new T.Group(); scene.add(root); parts = {};
    const skinM = mat(P.skin,{roughness:.6}), hairM = mat(P.hair,{roughness:.35,metalness:.1,emissive:P.hairShine,emissiveIntensity:.07});
    const topM = mat(P.top,{roughness:.8}), pantsM = mat(P.pants,{roughness:.9}), shoeM = mat(P.shoes,{roughness:.6});
    const eyeM = mat(P.eye,{roughness:.25}), white = mat('#ffffff',{roughness:.2}), dark = mat('#17101a',{roughness:.3});
    const body = new T.Group(); root.add(body); parts.body = body;
    const pw = P.pantsWidth;

    // legs + shoes
    [-1,1].forEach(s=>{
      const leg = new T.Mesh(new T.CylinderGeometry(.2*pw,.27*pw,1.4,24), pantsM); leg.position.set(s*.18,.82,0); body.add(leg);
      const shoe = sph(.22,shoeM,1.05,.55,1.55); shoe.position.set(s*.2,.12,.1); body.add(shoe);
      if(P.cargo){ const pk = new T.Mesh(new T.BoxGeometry(.07*pw,.3,.2), pantsM); pk.position.set(s*(.18+.25*pw),.95,.02); body.add(pk); }
    });
    const waist = new T.Mesh(new T.CylinderGeometry(.34,.37,.32,28), pantsM); waist.position.y = 1.5; body.add(waist);
    const belt = new T.Mesh(new T.TorusGeometry(.355,.02,8,32), mat('#555560',{metalness:.5})); belt.rotation.x = Math.PI/2; belt.position.y = 1.62; body.add(belt);

    // torso + midriff
    const crop = P.topCrop; const topH = .62 - crop*.25, topBase = 1.72 + crop*.25;
    const belly = new T.Mesh(new T.CylinderGeometry(.27,.29,.14+crop*.25,28), skinM); belly.position.y = 1.68+crop*.12; body.add(belly);
    const torso = new T.Mesh(new T.CylinderGeometry(.3,.28,topH,32), topM); torso.position.y = topBase+topH/2; body.add(torso);
    const bust = sph(.3,topM,1,.55,.8); bust.position.set(0,topBase+topH*.72,.05); body.add(bust);
    const neck = new T.Mesh(new T.CylinderGeometry(.08,.09,.2,16), skinM); neck.position.y = 2.42; body.add(neck);
    const shoulders = sph(.33,skinM,1,.28,.6); shoulders.position.y = 2.31; body.add(shoulders);
    if(P.necklace){ const n = new T.Mesh(new T.TorusGeometry(.14,.008,8,24,Math.PI), mat('#e8e8ee',{metalness:.8,roughness:.2})); n.rotation.x = Math.PI*.5+.35; n.rotation.z = Math.PI; n.position.set(0,2.27,.2); body.add(n); }

    // arms (shoulder pivot → elbow pivot)
    ['L','R'].forEach((k,i)=>{
      const s = i? 1:-1;
      const sh = new T.Group(); sh.position.set(s*.36,2.28,0); body.add(sh);
      const up = limb(.075,.065,.5,skinM); sh.add(up);
      const el = new T.Group(); el.position.y = -.5; sh.add(el);
      const fo = limb(.065,.05,.46,skinM); el.add(fo);
      const hand = sph(.075,skinM,1,1.2,.7); hand.position.y = -.5; el.add(hand);
      parts['sh'+k] = sh; parts['el'+k] = el;
    });

    // head
    const R = .42*P.headSize; const HY = 2.62+R;
    const head = new T.Group(); head.position.set(0,2.5,0); body.add(head); parts.head = head;
    const hy = HY-2.5;
    const skull = sph(R,skinM,1,1.04,.98); skull.position.y = hy; head.add(skull);
    const chin = sph(R*.7,skinM,.9,.8,.85); chin.position.set(0,hy-R*.42,R*.12); head.add(chin);
    // eyes
    const eyes = new T.Group(); head.add(eyes); parts.eyes = eyes; eyes.position.y = hy-R*.06;
    [-1,1].forEach(s=>{
      const ex = s*R*.38, ey = hy-R*.06, ez = Math.sqrt(Math.max(R*R-ex*ex-(ey-hy)*(ey-hy),0))*.97;
      const es = P.eyeSize;
      const w = sph(R*.2*es,white,1,1.15,.35); w.position.set(ex,0,ez); w.rotation.y = s*-.3; eyes.add(w);
      const iris = sph(R*.15*es,eyeM,1,1.2,.3); iris.position.set(ex,-.005,ez+R*.05*es); iris.rotation.y = s*-.3; eyes.add(iris);
      const pup = sph(R*.075*es,dark,1,1.2,.3); pup.position.set(ex,-.005,ez+R*.085*es); pup.rotation.y = s*-.3; eyes.add(pup);
      const hl = sph(R*.04*es,white,1,1,.5); hl.position.set(ex+R*.045,R*.07*es,ez+R*.1*es); eyes.add(hl);
      const lash = new T.Mesh(new T.BoxGeometry(R*.34*es,R*.025,R*.03), dark); lash.position.set(ex,R*.2*es,ez-.005); lash.rotation.z = s*-.15; lash.rotation.y = s*-.3; eyes.add(lash);
      const bl = sph(R*.13,mat('#ff8fa0',{transparent:true,opacity:P.blush*.55,roughness:1}),1,.55,.2); bl.position.set(s*R*.6,hy-R*.3,Math.sqrt(Math.max(R*R-(R*.6)**2-(R*.3)**2,0))*.97); bl.rotation.y = s*-.7; head.add(bl);
    });
    const nose = sph(R*.03,mat(P.skin,{roughness:.6}),1,1,1); nose.position.set(0,hy-R*.2,R*.99); head.add(nose);
    const mouth = new T.Mesh(new T.TorusGeometry(R*.1,R*.018,8,20,Math.PI), mat('#d9667a',{roughness:.5}));
    mouth.rotation.z = Math.PI; mouth.position.set(0,hy-R*.34+R*.05,Math.sqrt(R*R-(R*.34)**2)*.98); head.add(mouth); parts.mouth = mouth;

    // hair
    const hl = P.hairLen;
    const yRad = .45*(.7+hl), topY = hy+R*.98;
    const back = sph(.5*P.headSize,hairM,1.0,yRad/(.5*P.headSize),.78); back.position.set(0,topY-yRad,-R*.2); head.add(back); parts.hairBack = back;
    const cap = new T.Mesh(new T.SphereGeometry(R*1.07,40,28,0,Math.PI*2,0,Math.PI*.58), hairM); cap.position.set(0,hy+R*.04,-R*.04); cap.scale.set(1,1.04,1.02); head.add(cap);
    // part line + bangs
    if(P.bangs>0){
      const nb = P.bangs>1?9:7;
      for(let i=0;i<nb;i++){
        const u = (i/(nb-1))*2-1; const x = u*R*.88, z = Math.sqrt(Math.max(R*R*1.05-x*x,0))*.9;
        const b = sph(R*.17,hairM,1,2.4+Math.abs(u)*.5,.5); b.position.set(x,hy+R*.52-Math.abs(u)*R*.14,z); b.rotation.z = -u*.25; b.rotation.y = u*.5; head.add(b);
      }
    }
    // side locks
    [-1,1].forEach(s=>{
      const lock = sph(R*.17,hairM,.8,Math.max(3.2,hl*2.4),.7); lock.position.set(s*R*.98,hy-R*.35-hl*R*.1,R*.05); lock.rotation.z = s*.05; head.add(lock);
    });

    // accessories
    const acc = P.accessory, ac = mat(P.accColor,{roughness:.4});
    if(acc==='bow'){
      const b = new T.Group(); b.position.set(R*.62,hy+R*.85,R*.2);
      [-1,1].forEach(s=>{ const w = new T.Mesh(new T.ConeGeometry(R*.26,R*.5,16),ac); w.rotation.z = s*Math.PI/2; w.position.x = s*R*.25; b.add(w); });
      b.add(sph(R*.1,ac)); b.rotation.z = -.35; head.add(b);
    } else if(acc==='ears'){
      [-1,1].forEach(s=>{ const e = new T.Mesh(new T.ConeGeometry(R*.24,R*.5,3),ac); e.position.set(s*R*.62,hy+R*1.05,0); e.rotation.z = -s*.35; head.add(e);
        const inn = new T.Mesh(new T.ConeGeometry(R*.14,R*.32,3),mat('#ffd0e0')); inn.position.set(s*R*.62,hy+R*1.02,R*.07); inn.rotation.z = -s*.35; head.add(inn); });
    } else if(acc==='halo'){
      const h = new T.Mesh(new T.TorusGeometry(R*.62,R*.04,12,40), new T.MeshBasicMaterial({color:P.accColor})); h.position.set(0,hy+R*1.45,0); h.rotation.x = Math.PI/2-.2; head.add(h); parts.halo = h;
    } else if(acc==='star'){
      const st = new T.Mesh(new T.OctahedronGeometry(R*.18), new T.MeshBasicMaterial({color:P.accColor})); st.position.set(R*.7,hy+R*.78,R*.5); head.add(st); parts.star = st;
    }

    // glow
    rim.color.set(P.glow); rim.intensity = .5+P.glowPower*1.6;
    rimFill.color.set(P.glow); rimFill.intensity = P.glowPower*.5;
    shadow.material.color.set('#000');
    root.scale.setScalar(P.height);
    root.rotation.y = spin.y;
    root.position.y = 0;
    applyView(true);
  }

  function applyView(force){
    const target = view==='face'?1:0;
    if(force) viewK = target;
    const k = ease(viewK);
    const hh = P.height;
    const fullY = 1.62*hh, faceY = (2.62+.42*P.headSize)*hh;
    camera.position.set(0, mix(fullY+.15, faceY, k), mix(8.6*Math.max(hh,.8), 3.0+P.headSize*.6, k));
    camera.lookAt(0, mix(fullY, faceY, k), 0);
  }

  function resize(){
    const w = container.clientWidth||300, h = container.clientHeight||300;
    renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix(); applyView(true);
  }
  const ro = (window.ResizeObserver? new ResizeObserver(resize):null); if(ro) ro.observe(container); else window.addEventListener('resize',resize);

  // drag to turn
  const el = renderer.domElement; let lastX = 0, lastTap = 0;
  el.addEventListener('pointerdown',e=>{ spin.dragging=true; spin.auto=false; lastX=e.clientX; el.setPointerCapture(e.pointerId); const n=Date.now(); if(n-lastTap<300){ spin.y=0; spin.vy=0; } lastTap=n; });
  el.addEventListener('pointermove',e=>{ if(!spin.dragging) return; const dx=e.clientX-lastX; lastX=e.clientX; spin.y+=dx*.012; spin.vy=dx*.012; });
  const up = ()=>{ spin.dragging=false; };
  el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);

  function animate(now){
    if(!running) return; raf = requestAnimationFrame(animate);
    const t = (now-t0)/1000;
    if(!spin.dragging){ spin.y += spin.vy; spin.vy *= .94; }
    root.rotation.y = spin.y + (spin.auto? Math.sin(t*.5)*.18:0);
    viewK += ((view==='face'?1:0)-viewK)*.08; applyView(false);
    poseT += .016;
    const b = parts.body, h = parts.head; if(!b) { renderer.render(scene,camera); return; }
    // base idle
    const breathe = Math.sin(t*1.8)*.012;
    b.position.y = breathe; b.rotation.z = 0; b.rotation.x = 0;
    h.rotation.set(Math.sin(t*.9)*.03, Math.sin(t*.6)*.1, Math.sin(t*.7)*.03);
    let shL=[Math.sin(t*1.8)*.03,0,.08], shR=[Math.sin(t*1.8+1)*.03,0,-.08], elL=0, elR=0;
    if(pose==='Wave'){ shR=[0,0,-2.5+Math.sin(t*7)*.1]; elR=-.2; elR=-.5+Math.sin(t*8)*.45; h.rotation.z = .08; }
    else if(pose==='Dance'){ b.position.y = Math.abs(Math.sin(t*5))*.12; b.rotation.z = Math.sin(t*5)*.07; h.rotation.z = Math.sin(t*5)*.12;
      shL=[0,0,2.1+Math.sin(t*5)*.4]; shR=[0,0,-2.1+Math.sin(t*5+Math.PI)*.4]; elL=.4; elR=-.4; }
    else if(pose==='Think'){ shR=[-1.1,0,-.35]; elR=-1.9; h.rotation.set(.05,.28,.12); }
    else if(pose==='Shy'){ shL=[-.8,0,.5]; shR=[-.8,0,-.5]; elL=-1.4; elR=1.4; h.rotation.set(.12,0,.12); }
    parts.shL.rotation.set(shL[0],shL[1],shL[2]); parts.shR.rotation.set(shR[0],shR[1],shR[2]);
    parts.elL.rotation.z = elL; parts.elR.rotation.z = elR;
    // blink
    const bl = (t%4.2)>4.08 ? .1 : 1; parts.eyes.scale.y = mix(parts.eyes.scale.y, bl, .5);
    if(parts.hairBack) parts.hairBack.rotation.z = Math.sin(t*1.2)*.02;
    if(parts.halo) parts.halo.position.y += Math.sin(t*2)*.0006;
    if(parts.star) parts.star.rotation.y = t*2;
    if(parts.mouth){ const sp = opts.speaking && opts.speaking(); parts.mouth.scale.y = sp? .6+Math.abs(Math.sin(t*14))*1.2 : 1; }
    renderer.render(scene,camera);
  }

  build(); resize(); raf = requestAnimationFrame(animate);

  return {
    params:()=>Object.assign({},P),
    set(p){ P = Object.assign({},P,p); build(); },
    replace(p){ P = Object.assign({},DEFAULTS,p); build(); },
    setPose(n){ pose = n; poseT = 0; },
    pose:()=>pose,
    setView(v){ view = v; },
    view:()=>view,
    snapshot(){ renderer.render(scene,camera); return renderer.domElement.toDataURL('image/png'); },
    destroy(){ running=false; cancelAnimationFrame(raf); if(ro) ro.disconnect(); renderer.dispose(); if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); }
  };
}

window.Opu3D = { create, DEFAULTS, PRESETS, POSES };
})();
