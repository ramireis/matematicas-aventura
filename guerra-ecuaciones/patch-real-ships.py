from pathlib import Path
p=Path("guerra-ecuaciones/www/index.html")
s=p.read_text(encoding="utf-8")
marker="ship.position.z=8;"
if "GE_REAL_SHIPS_V1" not in s:
    code=r'''
/* GE_REAL_SHIPS_V1: modelos 3D nativos pilotables Mundo 1 */
let selectedShipModel="A1";
function gePart(g,m,x=0,y=0,z=0,rx=0,ry=0,rz=0){
 const q=new T.Mesh(g,m);q.position.set(x,y,z);q.rotation.set(rx,ry,rz);ship.add(q);return q;
}
function geClearShip(){while(ship.children.length)ship.remove(ship.children[0]);}
function geEngine(x,y,z,color){
 const body=gePart(new T.CylinderGeometry(.48,.58,2.35,16),dark,x,y,z,Math.PI/2);
 const core=gePart(new T.CylinderGeometry(.38,.38,.18,18),new T.MeshBasicMaterial({color}),x,y,z+1.22,Math.PI/2);
 const flame=gePart(new T.ConeGeometry(.34,2.2,14,1,true),new T.MeshBasicMaterial({color,transparent:true,opacity:.72,side:T.DoubleSide}),x,y,z+2.2,-Math.PI/2);
 return {body,core,flame};
}
function buildCometa(){
 geClearShip();
 const red=mat(0xc51424,.65,.26),metal=mat(0x303943,.8,.28),cyan=0x39dfff;
 gePart(new T.BoxGeometry(2.15,.58,6.5),white,0,0,-.2);
 let nose=gePart(new T.ConeGeometry(1.08,4.2,4),white,0,0,-5.35,-Math.PI/2);nose.scale.x=.72;
 gePart(new T.BoxGeometry(1.05,.38,2.25),glass,0,.48,-1.75);
 for(const q of [-1,1]){
  let w=gePart(new T.BoxGeometry(3.25,.16,3.0),red,q*2.35,-.12,.25,0,0,q*.08);
  gePart(new T.BoxGeometry(.20,1.55,1.55),red,q*3.72,.55,1.2);
  gePart(new T.BoxGeometry(1.15,.18,2.25),metal,q*2.05,-.28,1.55);
  geEngine(q*.92,-.18,2.75,cyan);
 }
}
function buildPulso(){
 geClearShip();
 const blue=mat(0x145bd7,.7,.22),silver=mat(0xaebbc7,.82,.24),cyan=0x25cfff;
 gePart(new T.BoxGeometry(2.55,.62,5.7),white,0,0,.15);
 let nose=gePart(new T.ConeGeometry(1.35,3.6,4),blue,0,0,-4.45,-Math.PI/2);nose.scale.x=.72;
 gePart(new T.BoxGeometry(1.18,.42,2.0),glass,0,.5,-1.15);
 for(const q of [-1,1]){
  let w=gePart(new T.BoxGeometry(4.1,.18,2.7),white,q*2.7,-.1,.65,0,0,q*.12);
  gePart(new T.BoxGeometry(2.0,.12,1.2),blue,q*3.0,.02,.15);
  gePart(new T.BoxGeometry(.28,.9,1.35),silver,q*4.55,.25,1.35);
  geEngine(q*1.18,-.12,2.55,cyan);
 }
}
function buildHalcon(){
 geClearShip();
 const yellow=mat(0xe7a414,.72,.34),charcoal=mat(0x24282e,.88,.32),orangeGlow=0xff8a22;
 gePart(new T.BoxGeometry(3.45,.92,5.25),yellow,0,0,.15);
 let nose=gePart(new T.ConeGeometry(1.7,3.25,4),charcoal,0,0,-4.1,-Math.PI/2);nose.scale.x=.8;
 gePart(new T.BoxGeometry(1.38,.55,1.85),glass,0,.67,-1.0);
 for(const q of [-1,1]){
  gePart(new T.BoxGeometry(4.45,.28,2.7),yellow,q*3.0,-.15,.55,0,0,q*.05);
  gePart(new T.BoxGeometry(2.1,.34,1.25),charcoal,q*2.45,-.38,1.45);
 }
 geEngine(-1.35,.05,2.35,orangeGlow);geEngine(1.35,.05,2.35,orangeGlow);
 geEngine(-.48,-.52,2.55,orangeGlow);geEngine(.48,-.52,2.55,orangeGlow);
}
function selectRealShip(id){
 selectedShipModel=id;
 if(id==="A1")buildCometa(); else if(id==="A2")buildPulso(); else buildHalcon();
 ship.userData.model=id;
 localStorage.setItem("ge_ship_m1",id);
 const box=document.getElementById("geHangar");if(box)box.remove();
}
function openRealHangar(){
 if(document.getElementById("geHangar"))return;
 const d=document.createElement("div");d.id="geHangar";
 d.innerHTML='<div class="ge-hangar-card"><h2>🚀 HANGAR · MUNDO 1</h2><p>Elige la nave que pilotarás.</p><div class="ge-ship-grid">'+
 '<button onclick="selectRealShip(\'A1\')"><b>A1 COMETA</b><small>Rápida y precisa<br>L:A:H 1 : 0.65 : 0.25</small></button>'+
 '<button onclick="selectRealShip(\'A2\')"><b>A2 PULSO</b><small>Ágil y equilibrada<br>L:A:H 1 : 0.80 : 0.30</small></button>'+
 '<button onclick="selectRealShip(\'A3\')"><b>A3 HALCÓN</b><small>Versátil y resistente<br>L:A:H 1 : 0.95 : 0.38</small></button>'+
 '</div></div>';document.body.appendChild(d);
}
window.selectRealShip=selectRealShip;window.openRealHangar=openRealHangar;
const geStyle=document.createElement("style");geStyle.textContent=`
#geHangar{position:fixed;inset:0;z-index:100000;background:#020713ee;display:grid;place-items:center;font-family:system-ui;color:white}
.ge-hangar-card{width:min(900px,92vw);padding:24px;border:1px solid #3bdcff;border-radius:22px;background:#071426;box-shadow:0 0 40px #00bfff55;text-align:center}
.ge-ship-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.ge-ship-grid button{min-height:145px;border:1px solid #42dfff;border-radius:16px;background:linear-gradient(#102842,#07111f);color:white;font-size:20px;cursor:pointer}.ge-ship-grid button:hover{transform:translateY(-3px);box-shadow:0 0 22px #2bdcff88}.ge-ship-grid small{display:block;margin-top:12px;font-size:13px;color:#bdefff}
`;document.head.appendChild(geStyle);
selectRealShip(localStorage.getItem("ge_ship_m1")||"A1");
setTimeout(openRealHangar,900);
'''
    s=s.replace(marker,marker+code)
# Ctrl cambia la vista real del motor, además de conservar C como respaldo
old="if(k==='c'&&!e.repeat)setView(view==='interior'?'exterior':'interior');"
new="if((k==='c'||e.key==='Control')&&!e.repeat){e.preventDefault();setView(view==='interior'?'exterior':'interior');}"
s=s.replace(old,new)
p.write_text(s,encoding="utf-8")
print("Modelos 3D Mundo 1 integrados:", p)
