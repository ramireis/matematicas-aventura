extends Control
const REQUIRED={
 "hero":"res://assets/hero.png","basic":"res://assets/demon_basic.png","fast":"res://assets/demon_fast.png",
 "tank":"res://assets/demon_tank.png","mage":"res://assets/demon_mage.png","guide":"res://assets/guide_nezuko.png","master":"res://assets/master_rengoku.png"}
const HERO_HITS:=14.0
const ENEMY_HITS:=12.0
const MOVE_SPEED:=330.0
const JUMP_SPEED:=650.0
const GRAVITY:=1700.0
var hero_hp:=100.0
var enemy_hp:=100.0
var hero_streak:=0
var enemy_streak:=0
var hero_y:=70.0
var velocity_y:=0.0
var dodging_until:=0
var enemy_dodging_until:=0
var attack_ready:=true
var stars:=0
var activity_stars:=10
var recovery_mode:=false
var recovery_answered:=0
var recovery_correct:=0
var bank:Array=[]
var current:Dictionary={}
@onready var hero=$Battle/Hero
@onready var enemy=$Battle/Enemy
@onready var hero_bar=$Battle/HeroHP
@onready var enemy_bar=$Battle/EnemyHP
@onready var message=$Battle/Message
@onready var question=$Education/Question
@onready var feedback=$Education/Feedback
@onready var answer_buttons=[$Education/Answers/A,$Education/Answers/B,$Education/Answers/C,$Education/Answers/D]

func _ready():
 _load_assets()
 _build_bank()
 for i in 4: answer_buttons[i].pressed.connect(_answer.bind(i))
 _new_question()
 message.text="← → mover · ↓ esquivar · M saltar · ESPACIO atacar"

func _load_assets():
 # Los recursos visuales son opcionales durante el arranque: el juego nunca se bloquea.
 if ResourceLoader.exists(REQUIRED.hero): hero.texture=load(REQUIRED.hero)
 if ResourceLoader.exists(REQUIRED.basic): enemy.texture=load(REQUIRED.basic)

func _process(delta):
 if recovery_mode:return
 var dir=Input.get_axis("move_left","move_right")
 hero.position.x=clamp(hero.position.x+dir*MOVE_SPEED*delta,20.0,1050.0)
 if hero.position.y<hero_y or velocity_y<0:
  velocity_y+=GRAVITY*delta;hero.position.y+=velocity_y*delta
  if hero.position.y>=hero_y:hero.position.y=hero_y;velocity_y=0
 if Input.is_action_just_pressed("jump") and hero.position.y>=hero_y:velocity_y=-JUMP_SPEED
 if Input.is_action_just_pressed("dodge"):
  dodging_until=Time.get_ticks_msec()+500;message.text="💨 Esquive: 0,5 s"
 if Input.is_action_just_pressed("attack"):_hero_attack()

func _hero_attack():
 if not attack_ready or enemy_hp<=0:return
 attack_ready=false
 if Time.get_ticks_msec()<enemy_dodging_until or abs(hero.position.x-enemy.position.x)>230:
  hero_streak=0;message.text="💨 Ataque esquivado"
 else:
  hero_streak+=1;var units=1
  if hero_streak==4:units=4;hero_streak=0;message.text="🔥 SUPERCOMBO +3 impactos"
  enemy_streak=0;enemy_hp=max(0,enemy_hp-units*(100.0/ENEMY_HITS));enemy_bar.value=enemy_hp
  if enemy_hp<=0:_enemy_defeated()
 get_tree().create_timer(.30).timeout.connect(func():attack_ready=true)

func _enemy_attack():
 if recovery_mode or enemy_hp<=0:return
 if Time.get_ticks_msec()<dodging_until:
  enemy_streak=0;message.text="🛡️ Esquivaste el ataque";return
 enemy_streak+=1;var units=1
 if enemy_streak==4:units=4;enemy_streak=0;message.text="⚠ SUPERCOMBO ENEMIGO"
 hero_streak=0;hero_hp=max(0,hero_hp-units*(100.0/HERO_HITS));hero_bar.value=hero_hp
 if hero_hp<=0:_start_recovery()

func _build_bank():
 for i in range(1,101):
  var a=20+i;var b=3+(i%17);var s=a+b
  bank.append({"q":"%d + %d = ?"%[a,b],"a":s,"o":[s,s+10,s-1,s+1],"tip":"Suma por valor posicional."})
  var x=6+(i%13);var y=2+(i%9);var p=x*y
  bank.append({"q":"%d × %d = ?"%[x,y],"a":p,"o":[p,p+x,p-y,p+2],"tip":"Representa grupos iguales."})
  var d=2+(i%8);var quo=3+(i%11);var n=d*quo
  bank.append({"q":"%d ÷ %d = ?"%[n,d],"a":quo,"o":[quo,quo+1,quo-1,d],"tip":"Comprueba multiplicando."})
  var start=i%25;var step=2+(i%7);var nxt=start+step*4
  bank.append({"q":"Completa: %d, %d, %d, %d, …"%[start,start+step,start+2*step,start+3*step],"a":nxt,"o":[nxt,nxt+step,nxt-1,nxt+1],"tip":"Identifica cuánto aumenta."})

func _new_question():
 current=bank.pick_random();question.text=current.q
 var opts=current.o.duplicate();opts.shuffle()
 for i in 4:answer_buttons[i].text=["A. ","B. ","C. ","D. "][i]+str(opts[i]);answer_buttons[i].set_meta("value",opts[i])

func _answer(i):
 var ok=answer_buttons[i].get_meta("value")==current.a
 if recovery_mode:
  recovery_answered+=1;if ok:recovery_correct+=1
  if recovery_answered>=10:_finish_recovery()
  else:_new_question()
  return
 if ok:
  stars+=activity_stars;activity_stars=10;hero_hp=min(100,hero_hp+10);hero_bar.value=hero_hp
  feedback.text="✅ Correcto · +10% vida · ACC/ERCA: "+current.tip+" · Marzano: explica tu estrategia."
  _new_question()
 else:
  activity_stars=max(0,activity_stars-2)
  feedback.text="❌ -2 estrellas. DUA: "+current.tip+" Vuelve a intentar la misma actividad."

func _start_recovery():
 recovery_mode=true;recovery_answered=0;recovery_correct=0;hero_hp=0;hero_bar.value=0
 feedback.text="❤️‍🩹 Examen de reanimación: 10 preguntas. 7–9 = 80%; 10/10 = 100%."
 _new_question()

func _finish_recovery():
 if recovery_correct<7:
  recovery_answered=0;recovery_correct=0;feedback.text="Necesitas 7/10. Reintenta.";_new_question();return
 hero_hp=100 if recovery_correct==10 else 80;hero_bar.value=hero_hp;recovery_mode=false
 feedback.text="✨ Reanimación completada. Vida: %d%%. Continúa resolviendo: cada acierto suma +10%%."%hero_hp

func _enemy_defeated():
 message.text="🏆 Demonio derrotado";enemy_hp=100;enemy_bar.value=100;hero_streak=0;enemy_streak=0

func _on_enemy_timer_timeout():_enemy_attack()
