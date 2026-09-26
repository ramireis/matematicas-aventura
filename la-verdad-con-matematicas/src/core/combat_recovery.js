export const COMBAT_CONFIG=Object.freeze({heroMaxHealth:100,enemyMaxHealth:100,minHitsToKillEnemy:12,minHitsToKillHero:14,enemyDamagePerHit:100/14,heroDamagePerHit:100/12,recoveryPerCorrect:10,recoveryExamSize:10,recoveryPass:7});
export class CombatRecoverySystem{
 constructor(callbacks={}){this.cb=callbacks;this.reset()}
 reset(){this.heroHealth=100;this.enemyHealth=100;this.heroHits=0;this.enemyHits=0;this.dead=false;this.recoveryCorrect=0;this.recoveryAnswered=0;this.emit()}
 heroAttackEnemy(){if(this.dead||this.enemyHealth<=0)return;this.heroHits++;this.enemyHealth=Math.max(0,100-this.heroHits*COMBAT_CONFIG.heroDamagePerHit);this.emit();if(this.heroHits>=12){this.enemyHealth=0;this.emit();this.cb.onEnemyDefeated?.()} }
 enemyAttackHero(){if(this.dead||this.enemyHealth<=0)return;this.enemyHits++;this.heroHealth=Math.max(0,100-this.enemyHits*COMBAT_CONFIG.enemyDamagePerHit);if(this.enemyHits>=14){this.heroHealth=0;this.dead=true}this.emit();if(this.dead)this.triggerHeroDeathEvent()}
 educationalCorrect(){if(!this.dead){this.heroHealth=Math.min(100,this.heroHealth+10);this.emit()}}
 triggerHeroDeathEvent(){this.recoveryCorrect=0;this.recoveryAnswered=0;this.cb.onHeroDeath?.()}
 registerRecoveryAnswer(correct){this.recoveryAnswered++;if(correct)this.recoveryCorrect++;this.cb.onRecoveryProgress?.(this.recoveryCorrect,this.recoveryAnswered);if(this.recoveryAnswered>=10)return this.processRecoveryExamResults(this.recoveryCorrect);return null}
 processRecoveryExamResults(correctCount){if(correctCount>=10){this.heroHealth=100;this.dead=false;this.emit();return{passed:true,health:100,decision:true}}if(correctCount>=7){this.heroHealth=80;this.dead=false;this.emit();return{passed:true,health:80,decision:true}}this.heroHealth=0;this.dead=true;this.emit();return{passed:false,health:0,retry:true}}
 continueRecoveryCorrect(){if(this.dead)return this.heroHealth;this.heroHealth=Math.min(100,this.heroHealth+10);this.emit();return this.heroHealth}
 resumeCombat(){this.enemyHealth=100;this.heroHits=0;this.enemyHits=0;this.emit()}
 emit(){this.cb.onHealthChange?.({hero:this.heroHealth,enemy:this.enemyHealth,heroHits:this.heroHits,enemyHits:this.enemyHits})}
}