import {SpriteEngine,GameCharacter,CHARACTER_ASSETS} from './engine/sprite_engine.js';
import {FighterState,FairCombatController,KEY_MAP} from './engine/fair_combat_controller.js';
import {ActivityManager,GAME_STATE,shuffleArray} from './core/activity_manager.js';
import {CURRICULUM_WORLDS} from './core/curriculum_map_7egb.js';

const $=s=>document.querySelector(s), screens=[...document.querySelectorAll('.screen')];
const REQUIRED=Object.values(CHARACTER_ASSETS);
const HERO_MAX_HITS=14, ENEMY_MAX_HITS=12, DODGE_MS=500;
let heroHP=100, enemyHP=100, phase='boot', locked=false, currentQuestion=null;
let recovery={answered:0,correct:0}, activity=new ActivityManager('M.3',10);
let questionIndex=0, worldExam=false, examScore=0, examAnswered=0;
const keys=new Set(), canvas=$('#gameCanvas'), engine=new SpriteEngine(canvas);
const heroSprite=engine.add(new GameCharacter(engine.ctx,CHARACTER_ASSETS.hero,80,50,190,250));
const enemySprite=engine.add(new GameCharacter(engine.ctx,CHARACTER_ASSETS.demonBasic,650,50,205,260));
const hero=new FighterState({x:90,groundY:145,side:1}), enemy=new FighterState({x:680,groundY:145,side:-1});

function show(id){screens.forEach(s=>s.classList.toggle('active',s.id===id))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function hpUI(){
  heroHP=clamp(heroHP,0,100); enemyHP=clamp(enemyHP,0,100);
  $('#hero-hp i').style.width=heroHP+'%'; $('#enemy-hp i').style.width=enemyHP+'%';
  $('#hero-hp em').textContent=Math.round(heroHP)+'%'; $('#enemy-hp em').textContent=Math.round(enemyHP)+'%';
}
function msg(t){$('#battle-message').textContent=t}
function setSpritePositions(){
  heroSprite.x=hero.x; heroSprite.y=hero.y;
  enemySprite.x=enemy.x; enemySprite.y=enemy.y;
}
function damageEnemy(units){
  enemyHP=clamp(enemyHP-units*(100/ENEMY_MAX_HITS),0,100); hpUI();
  msg(units>1?'🔥 ¡SUPERCOMBO! +3 impactos adicionales':'⚔️ Impacto certero');
  if(enemyHP<=0) enemyDefeated();
}
function damageHero(units){
  heroHP=clamp(heroHP-units*(100/HERO_MAX_HITS),0,100); hpUI();
  msg(units>1?'💥 ¡Supercombo enemigo!':'💥 El demonio te alcanzó');
  if(heroHP<=0) heroDefeated();
}
const combat=new FairCombatController({
  hero,enemy,
  onHit:(attacker,target,units)=> attacker===hero?damageEnemy(units):damageHero(units),
  onCombo:(attacker)=>msg(attacker===hero?'🔥 SUPERCOMBO DEL CAZADOR':'⚠️ SUPERCOMBO ENEMIGO'),
  onMiss:(attacker)=>msg(attacker===hero?'💨 El enemigo esquivó':'🛡️ Esquivaste el ataque'),
  onEnemyDefeated:()=>enemyDefeated(), onHeroDefeated:()=>heroDefeated()
});

async function preloadRequiredAssets(){
  const failed=[];
  await Promise.all(REQUIRED.map(src=>new Promise(resolve=>{
    const im=new Image(); im.onload=resolve; im.onerror=()=>{failed.push(src);resolve()}; im.src=src;
  })));
  if(failed.length){
    phase='blocked'; $('#asset-warning').classList.remove('hidden');
    $('#asset-warning').innerHTML='<b>⚠ RECURSOS OBLIGATORIOS FALTANTES</b><br>'+failed.join('<br>')+'<br>No se usarán figuras geométricas como sustituto.';
    return false;
  }
  return true;
}
window.addEventListener('asset:error',e=>{if(phase!=='blocked')console.warn('Asset:',e.detail.src)});

function buildQuestionBank(){
  const bank=[];
  for(let i=1;i<=100;i++){
    let a=20+i,b=3+(i%17),ans=a+b;
    bank.push({id:'sum'+i,q:`${a} + ${b} = ?`,a:ans,o:[ans,ans+10,ans-1,ans+1],tip:'Suma por valor posicional.'});
    let x=6+(i%13),y=2+(i%9),p=x*y;
    bank.push({id:'mul'+i,q:`${x} × ${y} = ?`,a:p,o:[p,p+x,p-y,p+2],tip:'Piensa en grupos iguales.'});
    let d=2+(i%8),quo=3+(i%11),n=d*quo;
    bank.push({id:'div'+i,q:`${n} ÷ ${d} = ?`,a:quo,o:[quo,quo+1,quo-1,d],tip:'Comprueba multiplicando divisor por cociente.'});
    let start=i%25,step=2+(i%7),next=start+step*4;
    bank.push({id:'seq'+i,q:`Completa: ${start}, ${start+step}, ${start+2*step}, ${start+3*step}, …`,a:next,o:[next,next+step,next-1,next+1],tip:`El patrón aumenta de ${step} en ${step}.`});
  }
  return bank;
}
const BANK=buildQuestionBank();
function randomQuestion(exclude=new Set()){
  const pool=BANK.filter(q=>!exclude.has(q.id)); return pool[Math.floor(Math.random()*pool.length)];
}
function renderWaiting(){
  $('#activity-content').innerHTML=`<div class="question-card"><h2>📘 ENTRENAMIENTO MATEMÁTICO</h2>
  <p>Resuelve actividades mientras combates. Cada respuesta correcta recupera <b>+10% de vida</b>.</p>
  <p>⭐ Actividad: <b>${activity.currentStars}/10</b> · Mundo: <b>${GAME_STATE.worldStars}/60</b></p>
  <button id="edu-start">COMENZAR RETO</button></div>`;
  $('#edu-start').onclick=()=>renderActivity();
}
function renderActivity(){
  phase=phase==='revive'?'revive':'battle';
  currentQuestion=randomQuestion();
  const opts=shuffleArray([...new Set(currentQuestion.o)]);
  $('#activity-content').innerHTML=`<div class="question-card"><div class="counter">ACC · ERCA · DUA</div>
  <h2>🧮 RETO MATEMÁTICO</h2><div class="question">${currentQuestion.q}</div>
  <div class="answers">${opts.map((v,i)=>`<button data-v="${v}">${String.fromCharCode(65+i)}. ${v}</button>`).join('')}</div>
  <div class="feedback">💡 Observa, piensa el patrón y comprueba tu procedimiento.</div>
  <div class="edu-actions"><span>⭐ ${activity.currentStars}/10 · Mundo ${GAME_STATE.worldStars}/60</span></div></div>`;
  document.querySelectorAll('.answers button').forEach(b=>b.onclick=()=>answerActivity(+b.dataset.v));
}
function answerActivity(v){
  if(locked)return; locked=true;
  const ok=v===currentQuestion.a, fb=$('.feedback');
  if(ok){
    const gained=activity.registerSuccess(); heroHP=Math.min(100,heroHP+10); hpUI();
    fb.innerHTML=`<b class="good">✅ Correcto · +10% vida · +${gained} ⭐</b><br>Conceptualización: ${currentQuestion.tip}<br>🧠 Marzano: ¿qué estrategia te permitió comprobarlo?`;
    activity=new ActivityManager('M.3',10);
  }else{
    activity.registerError();
    fb.innerHTML=`<b class="bad">❌ Aún no.</b> Pierdes 2 ⭐ de esta actividad, pero puedes volver a intentarlo.<br>🖼️ DUA: ${currentQuestion.tip}`;
  }
  document.querySelectorAll('.answers button').forEach(b=>b.disabled=true);
  setTimeout(()=>{locked=false;if(ok){if(GAME_STATE.worldStars>=60)renderWorldExamIntro();else renderActivity()}else renderActivity()},1100);
}
function renderWorldExamIntro(){
  $('#activity-content').innerHTML=`<div class="question-card"><h2>🏆 EVALUACIÓN DEL MUNDO DESBLOQUEADA</h2>
  <p>Has conseguido al menos 60 estrellas. Resolverás <b>10 preguntas aleatorias</b> del banco de 400.</p>
  <p>Necesitas <b>7/10</b> para superar el mundo.</p><button id="exam-start">INICIAR EVALUACIÓN</button></div>`;
  $('#exam-start').onclick=startWorldExam;
}
function startWorldExam(){worldExam=true;examScore=0;examAnswered=0;GAME_STATE.usedQuestionIds.clear();renderExamQuestion()}
function renderExamQuestion(){
  if(examAnswered>=10)return finishWorldExam();
  currentQuestion=randomQuestion(GAME_STATE.usedQuestionIds);GAME_STATE.usedQuestionIds.add(currentQuestion.id);
  const opts=shuffleArray([...new Set(currentQuestion.o)]);
  $('#activity-content').innerHTML=`<div class="question-card"><h2>🏆 EVALUACIÓN · ${examAnswered+1}/10</h2>
  <div class="question">${currentQuestion.q}</div><div class="answers">${opts.map((v,i)=>`<button data-v="${v}">${String.fromCharCode(65+i)}. ${v}</button>`).join('')}</div>
  <div class="feedback">Respuestas A/B/C/D mezcladas en cada intento.</div></div>`;
  document.querySelectorAll('.answers button').forEach(b=>b.onclick=()=>{if(+b.dataset.v===currentQuestion.a)examScore++;examAnswered++;renderExamQuestion()});
}
function finishWorldExam(){
  worldExam=false;
  if(examScore>=7){GAME_STATE.currentWorld++;GAME_STATE.worldStars=0;popup('🏆 MUNDO SUPERADO',`Resultado: <b>${examScore}/10</b>. Se desbloqueó el siguiente mundo.`,'CONTINUAR',()=>{closeModal();renderWaiting()})}
  else popup('📚 SIGUE ENTRENANDO',`Resultado: <b>${examScore}/10</b>. Necesitas 7/10.`,'REINTENTAR',()=>{closeModal();startWorldExam()});
}
function heroDefeated(){
  if(phase==='revive')return; phase='revive'; combat.enabled=false; heroHP=0; hpUI(); recovery={answered:0,correct:0}; msg('❤️‍🩹 Debes superar la recuperación para volver'); renderRecoveryQuestion();
}
function renderRecoveryQuestion(){
  if(recovery.answered>=10)return finishRecovery();
  currentQuestion=randomQuestion();
  const opts=shuffleArray([...new Set(currentQuestion.o)]);
  $('#activity-content').innerHTML=`<div class="question-card"><h2>❤️‍🩹 EXAMEN DE REANIMACIÓN</h2>
  <div class="counter">Pregunta ${recovery.answered+1}/10 · Aciertos ${recovery.correct}</div><div class="question">${currentQuestion.q}</div>
  <div class="answers">${opts.map((v,i)=>`<button data-v="${v}">${String.fromCharCode(65+i)}. ${v}</button>`).join('')}</div>
  <div class="feedback">7–9 correctas → 80% de vida · 10/10 → 100%.</div></div>`;
  document.querySelectorAll('.answers button').forEach(b=>b.onclick=()=>{if(+b.dataset.v===currentQuestion.a)recovery.correct++;recovery.answered++;renderRecoveryQuestion()});
}
function finishRecovery(){
  if(recovery.correct<7){heroHP=0;hpUI();popup('AÚN NO PUEDES LEVANTARTE',`${recovery.correct}/10. Necesitas al menos 7.`,'🔁 REINTENTAR',()=>{closeModal();recovery={answered:0,correct:0};renderRecoveryQuestion()});return}
  heroHP=recovery.correct===10?100:80; hpUI();
  $('#activity-content').innerHTML=`<div class="question-card"><h2>✨ REANIMACIÓN COMPLETADA</h2><p>Vida actual: <b>${heroHP}%</b></p>
  <button id="back-fight">⚔️ VOLVER A LA BATALLA</button><button id="more-life">❤️ SEGUIR RECUPERANDO VIDA</button></div>`;
  $('#back-fight').onclick=resumeAfterRevive; $('#more-life').onclick=renderRecoveryBoost;
}
function renderRecoveryBoost(){
  if(heroHP>=100)return resumeAfterRevive();
  currentQuestion=randomQuestion();const opts=shuffleArray([...new Set(currentQuestion.o)]);
  $('#activity-content').innerHTML=`<div class="question-card"><h2>❤️ RECUPERACIÓN EXTRA</h2><div class="question">${currentQuestion.q}</div>
  <div class="answers">${opts.map(v=>`<button data-v="${v}">${v}</button>`).join('')}</div><div class="feedback">Cada acierto: +10%.</div></div>`;
  document.querySelectorAll('.answers button').forEach(b=>b.onclick=()=>{if(+b.dataset.v===currentQuestion.a)heroHP=Math.min(100,heroHP+10);hpUI();renderRecoveryBoost()});
}
function resumeAfterRevive(){phase='battle';combat.enabled=true;hero.totalHitsLanded=0;enemy.totalHitsLanded=Math.round((100-enemyHP)/(100/ENEMY_MAX_HITS));renderWaiting();msg('⚔️ Regresas al mismo combate con tu vida recuperada.')}
function enemyDefeated(){
  if(enemyHP>0)return; combat.enabled=false; phase='victory'; msg('🏆 Demonio derrotado. Continúa el entrenamiento matemático.');
  setTimeout(()=>{enemyHP=100;enemy.totalHitsLanded=0;hero.totalHitsLanded=0;combat.enabled=true;phase='battle';hpUI()},1800);
}
function popup(title,html,label,action){$('#modal-card').innerHTML=`<h2>${title}</h2><p>${html}</p><button id="close-modal">${label}</button>`;$('#modal').classList.remove('hidden');$('#close-modal').onclick=action}
function closeModal(){$('#modal').classList.add('hidden')}

let last=performance.now(),aiAt=0;
function loop(now){
  const dt=Math.min(.033,(now-last)/1000);last=now;
  if(phase==='battle'){
    hero.move=(keys.has(KEY_MAP.RIGHT)?1:0)-(keys.has(KEY_MAP.LEFT)?1:0);
    hero.update(dt,now,{minX:20,maxX:canvas.clientWidth-210});enemy.update(dt,now,{minX:20,maxX:canvas.clientWidth-210});
    if(now-aiAt>520){combat.enemyThink(now);aiAt=now}
    setSpritePositions();
  }
  requestAnimationFrame(loop);
}
addEventListener('keydown',e=>{
  if(!$('#play-screen').classList.contains('active')||phase!=='battle')return;
  if([KEY_MAP.RIGHT,KEY_MAP.LEFT,KEY_MAP.DODGE,KEY_MAP.JUMP,KEY_MAP.ATTACK].includes(e.code))e.preventDefault();
  keys.add(e.code);
  if(e.code===KEY_MAP.DODGE){hero.dodge(performance.now());msg('💨 Esquive: 0,5 s de invulnerabilidad')}
  if(e.code===KEY_MAP.JUMP)hero.jump();
  if(e.code===KEY_MAP.ATTACK)combat.attack(hero,enemy,ENEMY_MAX_HITS,performance.now());
});
addEventListener('keyup',e=>keys.delete(e.code));

$('#start-btn').onclick=async()=>{
  show('play-screen'); $('#activity-content').innerHTML='<div class="question-card"><h2>Verificando recursos…</h2></div>';
  if(!(await preloadRequiredAssets()))return;
  phase='battle';engine.start();renderWaiting();hpUI();msg('⚔️ Flechas para moverte · ↓ esquiva · M salta · ESPACIO ataca');requestAnimationFrame(loop);
};
$('#worlds-btn').onclick=()=>{show('world-screen');const g=$('#world-grid');g.innerHTML='';Object.values(CURRICULUM_WORLDS).slice(0,5).forEach((w,i)=>{const c=document.createElement('article');c.className='world-card '+(i>=GAME_STATE.currentWorld?'locked':'');c.innerHTML=`<h3>Mundo ${i+1}</h3><h3>${w.title}</h3><div class="stars">⭐ ${i===GAME_STATE.currentWorld-1?GAME_STATE.worldStars:0}/60</div>`;g.append(c)})};
$('.back').onclick=()=>show('start-screen');
$('#progress-btn').onclick=()=>popup('MI PROGRESO',`⭐ ${GAME_STATE.totalStars} estrellas · Mundo ${GAME_STATE.currentWorld} · Vida ${Math.round(heroHP)}%`,'CERRAR',closeModal);
hpUI();setSpritePositions();