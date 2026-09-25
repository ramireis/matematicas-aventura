import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { getPalette } from './src/engine/effects/color_palette.js';

export class PlayerShip {
  constructor(scene,{onFire=null}={}) {
    this.scene=scene; this.mesh=null; this.loader=new GLTFLoader();
    this.keys=new Set(); this.onFire=onFire;
    this.moveSpeed=15; this.bank=0.35;
    this.cooldowns={CANNON:140,MACHINE_GUN:75,MISSILE:700,FLARE:900,ROCKET:500};
    this.lastShot={};
    this._down=e=>this.keys.add(e.code);
    this._up=e=>this.keys.delete(e.code);
    addEventListener('keydown',this._down,{passive:true});
    addEventListener('keyup',this._up,{passive:true});
  }
  loadA1Cometa(onLoaded){
    return new Promise((resolve,reject)=>{
      this.loader.load('./assets/models/ships/a1_cometa.glb',gltf=>{
        if(this.mesh)this.scene.remove(this.mesh);
        this.mesh=gltf.scene;
        this.mesh.scale.setScalar(1.5); this.mesh.position.set(0,0,0);
        this.mesh.traverse(n=>{if(!n.isMesh)return;n.castShadow=false;n.receiveShadow=false;
          const mats=Array.isArray(n.material)?n.material:[n.material];
          mats.filter(Boolean).forEach(m=>{m.toneMapped=false;});
        });
        this.scene.add(this.mesh);
        this.applyPalette(getPalette('world1'));
        onLoaded?.(this.mesh); resolve(this.mesh);
      },undefined,err=>{console.error('Error al cargar A1 Cometa:',err);reject(err);});
    });
  }
  applyPalette(palette){
    if(!this.mesh || !palette)return;
    this.mesh.traverse(node=>{
      if(!node.isMesh || !node.material)return;
      const mats=Array.isArray(node.material)?node.material:[node.material];
      mats.forEach(material=>{
        if(!material)return;
        const name=material.name||"";
        if(name.includes("Cockpit")){
          if(material.emissive) material.emissive.setHex(palette.primary);
          material.emissiveIntensity=3.0;
        }
        if(name.includes("Engine")){
          if(material.emissive) material.emissive.setHex(palette.engine);
          material.emissiveIntensity=4.0;
        }
      });
    });
  }
  update(dt){
    if(!this.mesh)return;
    const step=this.moveSpeed*Math.min(dt,0.05);
    if(this.keys.has('ArrowUp'))this.mesh.position.y+=step;
    if(this.keys.has('ArrowDown'))this.mesh.position.y-=step;
    let target=0;
    if(this.keys.has('ArrowLeft')){this.mesh.position.x-=step;target=this.bank;}
    if(this.keys.has('ArrowRight')){this.mesh.position.x+=step;target=-this.bank;}
    this.mesh.rotation.z=THREE.MathUtils.lerp(this.mesh.rotation.z,target,0.12);
    if(this.keys.has('Space'))this.fireWeapon('CANNON');
    if(this.keys.has('KeyN'))this.fireWeapon('MACHINE_GUN');
    if(this.keys.has('KeyM'))this.fireWeapon('MISSILE');
    if(this.keys.has('KeyB'))this.fireWeapon('FLARE');
    if(this.keys.has('KeyV'))this.fireWeapon('ROCKET');
  }
  fireWeapon(type){
    const now=performance.now(),wait=this.cooldowns[type]??200;
    if(now-(this.lastShot[type]??-Infinity)<wait)return;
    this.lastShot[type]=now;
    const detail={type,ship:this.mesh};
    this.onFire?.(detail);
    dispatchEvent(new CustomEvent('ship:fire',{detail}));
  }
  dispose(){
    removeEventListener('keydown',this._down);removeEventListener('keyup',this._up);
    if(this.mesh)this.scene.remove(this.mesh);
  }
}
