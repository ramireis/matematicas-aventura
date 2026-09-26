// Motor visual 2D cinematográfico para Electron/HTML5 Canvas.
// No reemplaza sprites faltantes con geometría. Diseñado para GPU integrada.
export class Cinematic2DEngine {
  constructor(canvas,{quality='auto'}={}){
    this.canvas=canvas; this.ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    this.dpr=Math.min(devicePixelRatio||1,1.5); this.entities=[]; this.particles=[];
    this.last=performance.now(); this.running=false; this.quality=quality;
  }
  add(entity){this.entities.push(entity);return entity}
  resize(){
    const r=this.canvas.getBoundingClientRect(),w=Math.max(1,Math.round(r.width*this.dpr)),h=Math.max(1,Math.round(r.height*this.dpr));
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
  }
  slash(x,y,color='#39dfff'){
    const count=this.quality==='low'?10:18;
    for(let i=0;i<count;i++)this.particles.push({x,y,vx:4+Math.random()*7,vy:(Math.random()-.5)*7,life:.45+Math.random()*.35,max:.8,color,size:2+Math.random()*5});
  }
  update(dt){
    for(const e of this.entities)e.update?.(dt);
    for(const p of this.particles){p.x+=p.vx*60*dt;p.y+=p.vy*60*dt;p.life-=dt}
    this.particles=this.particles.filter(p=>p.life>0);
  }
  render(){
    const c=this.ctx,r=this.canvas.getBoundingClientRect();c.clearRect(0,0,r.width,r.height);
    for(const e of this.entities)e.render?.(c);
    c.save();c.globalCompositeOperation='lighter';
    for(const p of this.particles){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=12;c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill()}
    c.restore();
  }
  start(){if(this.running)return;this.running=true;const tick=t=>{if(!this.running)return;this.resize();const dt=Math.min((t-this.last)/1000,.033);this.last=t;this.update(dt);this.render();requestAnimationFrame(tick)};requestAnimationFrame(tick)}
  stop(){this.running=false}
}
export class SpriteActor {
  constructor(image,{x=0,y=0,w=180,h=240,flip=false}={}){this.image=image;this.x=x;this.y=y;this.w=w;this.h=h;this.flip=flip;this.baseX=x;this.attackT=0}
  attack(){this.attackT=.28}
  update(dt){if(this.attackT>0)this.attackT-=dt}
  render(c){if(!this.image?.complete||!this.image.naturalWidth)return;const lunge=this.attackT>0?Math.sin((.28-this.attackT)/.28*Math.PI)*24:0;c.save();c.translate(this.x+lunge+(this.flip?this.w:0),this.y);if(this.flip)c.scale(-1,1);c.drawImage(this.image,0,0,this.w,this.h);c.restore()}
}