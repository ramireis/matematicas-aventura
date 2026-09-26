export const KEY_MAP=Object.freeze({RIGHT:'ArrowRight',LEFT:'ArrowLeft',DODGE:'ArrowDown',JUMP:'KeyM',ATTACK:'Space'});
export const FIGHTER_CONFIG=Object.freeze({moveSpeed:260,jumpVelocity:-620,gravity:1750,dodgeMs:500,attackRange:155,attackCooldownMs:300,comboEvery:4,comboBonusHits:3});
export class FighterState{
 constructor({x=100,groundY=0,side=1}={}){this.x=x;this.y=groundY;this.groundY=groundY;this.vy=0;this.side=side;this.isJumping=false;this.isDodging=false;this.dodgeUntil=0;this.hitStreak=0;this.totalHitsLanded=0;this.lastAttack=0;this.move=0}
 update(dt,now,bounds){this.isDodging=now<this.dodgeUntil;this.x=Math.max(bounds.minX,Math.min(bounds.maxX,this.x+this.move*FIGHTER_CONFIG.moveSpeed*dt));if(this.isJumping){this.vy+=FIGHTER_CONFIG.gravity*dt;this.y+=this.vy*dt;if(this.y>=this.groundY){this.y=this.groundY;this.vy=0;this.isJumping=false}}}
 jump(){if(!this.isJumping){this.isJumping=true;this.vy=FIGHTER_CONFIG.jumpVelocity}}
 dodge(now=performance.now()){this.isDodging=true;this.dodgeUntil=now+FIGHTER_CONFIG.dodgeMs}
}
export class FairCombatController{
 constructor({hero,enemy,onHit=()=>{},onCombo=()=>{},onMiss=()=>{},onEnemyDefeated=()=>{},onHeroDefeated=()=>{}}){Object.assign(this,{hero,enemy,onHit,onCombo,onMiss,onEnemyDefeated,onHeroDefeated});this.enabled=true}
 distance(a,b){return Math.abs(a.x-b.x)}
 attack(attacker,target,targetHitsToDefeat,now=performance.now()){if(!this.enabled||now-attacker.lastAttack<FIGHTER_CONFIG.attackCooldownMs)return false;attacker.lastAttack=now;if(target.isDodging||this.distance(attacker,target)>FIGHTER_CONFIG.attackRange){attacker.hitStreak=0;this.onMiss(attacker,target);return false}attacker.hitStreak++;let hits=1;if(attacker.hitStreak===FIGHTER_CONFIG.comboEvery){hits+=FIGHTER_CONFIG.comboBonusHits;attacker.hitStreak=0;this.onCombo(attacker,target,hits)}attacker.totalHitsLanded+=hits;target.hitStreak=0;this.onHit(attacker,target,hits);if(attacker.totalHitsLanded>=targetHitsToDefeat){this.enabled=false;if(target===this.enemy)this.onEnemyDefeated();else this.onHeroDefeated()}return true}
 enemyThink(now=performance.now()){if(!this.enabled)return;const d=this.distance(this.enemy,this.hero),r=Math.random();this.enemy.move=d>FIGHTER_CONFIG.attackRange*.8?(this.enemy.x>this.hero.x?-1:1):(r<.18?(this.enemy.x>this.hero.x?1:-1):0);if(r>.88)this.enemy.dodge(now);else if(r>.78)this.enemy.jump();else if(d<=FIGHTER_CONFIG.attackRange&&r>.42)this.attack(this.enemy,this.hero,14,now)}
}