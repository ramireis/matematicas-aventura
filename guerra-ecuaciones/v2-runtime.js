import * as THREE from './vendor/three.module.js';
import { getPalette } from './src/engine/effects/color_palette.js';
import { setupDramaticLighting } from './src/engine/effects/lighting_setup.js';
import { ParticleSystem } from './src/engine/particles.js';
import { createAsteroid, updateAsteroid } from './src/engine/asteroids.js';

let started=false;
function makeShip(){
  const g=new THREE.Group(); g.name='A1_Cometa_Runtime';
  const white=new THREE.MeshStandardMaterial({color:0xf5f7ff,roughness:.28,metalness:.55});
  const red=new THREE.MeshStandardMaterial({color:0xd41432,roughness:.3,metalness:.45});
  const cyan=new THREE.MeshStandardMaterial({color:0x25dfff,emissive:0x00e5ff,emissiveIntensity:3,toneMapped:false});
  const body=new THREE.Mesh(new THREE.ConeGeometry(.75,3.2,10),white); body.rotation.z=-Math.PI/2; g.add(body);
  const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.48,16,8),cyan); cockpit.scale.set(1.4,.55,.55); cockpit.position.set(.45,.38,0); g.add(cockpit);
  const wingGeo=new THREE.BoxGeometry(1.8,.10,2.6);
  const wings=new THREE.Mesh(wingGeo,red); wings.position.x=-.35; g.add(wings);
  for(const z of [-.72,.72]){
    const e=new THREE.Mesh(new THREE.CylinderGeometry(.28,.34,1.3,10),white); e.rotation.z=Math.PI/2; e.position.set(-1.0,-.15,z); g.add(e);
    const glow=new THREE.Mesh(new THREE.CircleGeometry(.24,12),cyan); glow.rotation.y=Math.PI/2; glow.position.set(-1.66,-.15,z); g.add(glow);
  }
  g.rotation.y=-Math.PI/2; g.scale.setScalar(.9); return g;
}
function startV2(){
  if(started)return; started=true;
  const palette=getPalette('world1');
  const host=document.createElement('div'); host.id='ge-v2-layer';
  Object.assign(host.style,{position:'fixed',left:'2px',top:'88px',width:'49.2vw',height:'calc(100vh - 94px)',zIndex:'7',pointerEvents:'none',overflow:'hidden',borderRadius:'12px'});
  document.body.appendChild(host);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.35)); renderer.setSize(host.clientWidth,host.clientHeight); renderer.setClearColor(palette.fog,1);
  renderer.outputColorSpace=THREE.SRGBColorSpace; host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(); setupDramaticLighting(scene,palette);
  const camera=new THREE.PerspectiveCamera(58,host.clientWidth/host.clientHeight,.1,300); camera.position.set(0,3.2,9); camera.lookAt(0,0,-10);
  const starsGeo=new THREE.BufferGeometry(); const sp=new Float32Array(900*3);
  for(let i=0;i<900;i++){sp[i*3]=(Math.random()-.5)*90;sp[i*3+1]=(Math.random()-.5)*55;sp[i*3+2]=-Math.random()*180;}
  starsGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
  scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xbfefff,size:.10,transparent:true,opacity:.9})));
  const ship=makeShip(); ship.position.set(0,-1.2,-4); scene.add(ship);
  const particles=new ParticleSystem(scene,palette);
  const asteroids=[]; for(let i=0;i<8;i++){const a=createAsteroid(.35+Math.random()*1.1,palette);a.position.set((Math.random()-.5)*13,(Math.random()-.5)*8,-12-Math.random()*55);scene.add(a);asteroids.push(a);}
  const keys=new Set(); addEventListener('keydown',e=>{keys.add(e.code);if(['Space','KeyN','KeyM','KeyB','KeyV'].includes(e.code)){e.preventDefault();const map={Space:'CANNON',KeyN:'MACHINE_GUN',KeyM:'MISSILE',KeyB:'FLARE',KeyV:'ROCKET'};particles.spawnBolt(map[e.code],ship.position.clone().add(new THREE.Vector3(0,0,-1.2)),new THREE.Vector3(0,0,-1));}});
  addEventListener('keyup',e=>keys.delete(e.code));
  const badge=document.createElement('div'); badge.textContent='V2 • A1 COMETA • MOTOR 3D ACTIVO';Object.assign(badge.style,{position:'fixed',left:'18px',top:'96px',zIndex:'8',color:'#bffcff',background:'rgba(0,10,28,.72)',border:'1px solid #00e5ff',borderRadius:'8px',padding:'6px 10px',font:'700 12px system-ui',pointerEvents:'none'});document.body.appendChild(badge);
  const clock=new THREE.Clock();
  function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);
    const speed=4.8*dt;if(keys.has('ArrowLeft'))ship.position.x-=speed;if(keys.has('ArrowRight'))ship.position.x+=speed;if(keys.has('ArrowUp'))ship.position.y+=speed;if(keys.has('ArrowDown'))ship.position.y-=speed;
    ship.position.x=THREE.MathUtils.clamp(ship.position.x,-5.5,5.5);ship.position.y=THREE.MathUtils.clamp(ship.position.y,-3.5,3.0);
    ship.rotation.z=THREE.MathUtils.lerp(ship.rotation.z,keys.has('ArrowLeft')?.28:keys.has('ArrowRight')?-.28:0,.12);
    const p=starsGeo.attributes.position.array;for(let i=2;i<p.length;i+=3){p[i]+=18*dt;if(p[i]>4)p[i]=-180;}starsGeo.attributes.position.needsUpdate=true;
    for(const a of asteroids){a.position.z+=5.2*dt;updateAsteroid(a,dt);if(a.position.z>3){a.position.set((Math.random()-.5)*13,(Math.random()-.5)*8,-55-Math.random()*35);}}
    particles.update(dt,ship.position);renderer.render(scene,camera);
  } loop();
  addEventListener('resize',()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});
}
document.addEventListener('click',e=>{const t=(e.target?.textContent||'').toUpperCase();if(t.includes('INICIAR MISIÓN')||t.includes('INICIAR MISION'))setTimeout(startV2,900);},true);
setTimeout(()=>{if(!document.body.innerText.toUpperCase().includes('INICIAR MISIÓN')&&!document.body.innerText.toUpperCase().includes('INICIAR MISION'))startV2();},2200);
