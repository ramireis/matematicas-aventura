extends Control

const ASSETS: Dictionary = {
 "hero":"res://assets/hero.png",
 "basic":"res://assets/demon_basic.png",
 "fast":"res://assets/demon_fast.png",
 "tank":"res://assets/demon_tank.png",
 "mage":"res://assets/demon_mage.png",
 "guide":"res://assets/guide_nezuko.png",
 "master":"res://assets/master_rengoku.png"
}
const HERO_DAMAGE: float = 100.0 / 12.0
const ENEMY_DAMAGE: float = 100.0 / 14.0
var hero_hp: float = 100.0
var enemy_hp: float = 100.0
var hero_streak: int = 0
var enemy_streak: int = 0
var hero_dodge_until: int = 0
var enemy_dodge_until: int = 0
var velocity_y: float = 0.0
var attack_clock: float = 0.0
var bank: Array[Dictionary] = []
var current: Dictionary = {}
var rng: RandomNumberGenerator = RandomNumberGenerator.new()
var recovery: bool = false
var recovery_count: int = 0
var recovery_ok: int = 0
var activity_stars: int = 10
var world_stars: int = 0
var general_score: int = 0
var final_score: int = 0
var world_unlocked: bool = false

@onready var battle: Control = $Battle
@onready var hero: TextureRect = $Battle/Hero
@onready var enemy: TextureRect = $Battle/Enemy
@onready var hero_ph: ColorRect = $Battle/HeroPlaceholder
@onready var enemy_ph: ColorRect = $Battle/EnemyPlaceholder
@onready var hero_bar: ProgressBar = $Battle/HeroHP
@onready var enemy_bar: ProgressBar = $Battle/EnemyHP
@onready var msg: Label = $Battle/Message
@onready var question: Label = $Education/Question
@onready var feedback: Label = $Education/FeedbackPanel/Feedback
@onready var answers: Array[Button] = [$Education/Answers/A,$Education/Answers/B,$Education/Answers/C,$Education/Answers/D]

func _ready() -> void:
 rng.randomize()
 _load_optional_assets()
 _build_bank()
 for i: int in range(answers.size()):
  answers[i].pressed.connect(_answer.bind(i))
 $WindowBar/Minimize.pressed.connect(_minimize)
 $WindowBar/Maximize.pressed.connect(_maximize)
 $WindowBar/Center.pressed.connect(_center_window)
 $WindowBar/Close.pressed.connect(_close)
 _new_question()
 _bars()
 msg.text = "← → mover · ↓ esquivar · M saltar · ESPACIO atacar"
 feedback.text = "💡 Misión matemática activa · ACC · ERCA · Marzano · DUA"

func _load_optional_assets() -> void:
 if ResourceLoader.exists(ASSETS.hero):
  var r: Resource = load(ASSETS.hero)
  if r is Texture2D:
   hero.texture = r
 if ResourceLoader.exists(ASSETS.basic):
  var r2: Resource = load(ASSETS.basic)
  if r2 is Texture2D:
   enemy.texture = r2
 hero_ph.visible = hero.texture == null
 enemy_ph.visible = enemy.texture == null
 if hero.texture == null or enemy.texture == null:
  msg.text = "⚔ Entrenamiento listo · recursos visuales opcionales"


func _process(delta: float) -> void:
 if recovery:
  return
 var dir: float = Input.get_axis("move_left","move_right")
 var dx: float = dir * 300.0 * delta
 hero.position.x = clamp(hero.position.x + dx,20.0,max(20.0,battle.size.x-210.0))
 hero_ph.position.x = hero.position.x + 20.0
 if Input.is_action_just_pressed("dodge"):
  hero_dodge_until = Time.get_ticks_msec() + 500
  hero_streak = 0
  msg.text = "💨 Esquive 0,5 s"
 if Input.is_action_just_pressed("jump") and hero.position.y >= 70.0:
  velocity_y = -500.0
 if hero.position.y < 70.0 or velocity_y < 0.0:
  velocity_y += 1200.0 * delta
  hero.position.y += velocity_y * delta
  if hero.position.y >= 70.0:
   hero.position.y = 70.0
   velocity_y = 0.0
  hero_ph.position.y = hero.position.y + 35.0
 if Input.is_action_just_pressed("attack"):
  _hero_attack()
 _enemy_ai(delta)

func _hero_attack() -> void:
 if abs(hero.position.x-enemy.position.x)>210.0 or Time.get_ticks_msec()<enemy_dodge_until:
  hero_streak=0
  msg.text="💨 Ataque esquivado o fuera de alcance"
  return
 hero_streak += 1
 var units: int = 1
 if hero_streak >= 4:
  units=4
  hero_streak=0
  msg.text="🔥 SUPERCOMBO +3 impactos"
 enemy_streak=0
 enemy_hp=max(0.0,enemy_hp-HERO_DAMAGE*float(units))
 _bars()
 if enemy_hp<=0.0:
  enemy_hp=100.0
  enemy.position.x=max(700.0,battle.size.x-260.0)
  enemy_ph.position.x=enemy.position.x+30.0
  msg.text="🏆 Demonio derrotado · nuevo rival"

func _enemy_ai(delta: float) -> void:
 var d: float=abs(hero.position.x-enemy.position.x)
 if d>210.0:
  enemy.position.x-=180.0*delta
  enemy_ph.position.x=enemy.position.x+30.0
 else:
  attack_clock-=delta
  if attack_clock<=0.0:
   attack_clock=rng.randf_range(0.7,1.2)
   if rng.randf()<0.18:
    enemy_dodge_until=Time.get_ticks_msec()+500
   else:
    _enemy_attack()

func _enemy_attack() -> void:
 if Time.get_ticks_msec()<hero_dodge_until:
  enemy_streak=0
  msg.text="🛡️ Esquivaste el ataque"
  return
 enemy_streak+=1
 var units: int=1
 if enemy_streak>=4:
  units=4
  enemy_streak=0
  msg.text="⚠ SUPERCOMBO ENEMIGO"
 hero_streak=0
 hero_hp=max(0.0,hero_hp-ENEMY_DAMAGE*float(units))
 _bars()
 if hero_hp<=0.0:
  recovery=true
  recovery_count=0
  recovery_ok=0
  feedback.text="❤️‍🩹 Reanimación: 10 preguntas. Necesitas 7 aciertos."
  _new_question()

func _build_bank() -> void:
 bank.clear()
 for i: int in range(1,101):
  var a: int=20+i
  var b: int=3+(i%17)
  var s: int=a+b
  bank.append({"q":"%d + %d = ?"%[a,b],"a":s,"o":[s,s+10,s-1,s+1],"tip":"Suma por valor posicional."})
  var x: int=6+(i%13)
  var y: int=2+(i%9)
  var p: int=x*y
  bank.append({"q":"%d × %d = ?"%[x,y],"a":p,"o":[p,p+x,p-y,p+2],"tip":"Piensa en grupos iguales."})
  var div: int=2+(i%8)
  var quo: int=3+(i%11)
  var n: int=div*quo
  bank.append({"q":"%d ÷ %d = ?"%[n,div],"a":quo,"o":[quo,quo+1,max(1,quo-1),div],"tip":"Comprueba multiplicando."})
  var st: int=i%25
  var step: int=2+(i%7)
  var nxt: int=st+step*4
  bank.append({"q":"Completa: %d, %d, %d, %d, …"%[st,st+step,st+2*step,st+3*step],"a":nxt,"o":[nxt,nxt+step,nxt-1,nxt+1],"tip":"Observa cuánto aumenta cada término."})

func _new_question() -> void:
 if bank.is_empty():
  question.text="Error interno: banco vacío"
  return
 current=bank[rng.randi_range(0,bank.size()-1)]
 question.text=str(current.q)
 var opts: Array=current.o.duplicate()
 opts.shuffle()
 for i: int in range(4):
  answers[i].text=["A. ","B. ","C. ","D. "][i]+str(opts[i])
  answers[i].set_meta("value",opts[i])

func _answer(i: int) -> void:
 var ok: bool=answers[i].get_meta("value")==current.a
 if recovery:
  recovery_count+=1
  if ok:
   recovery_ok+=1
  if recovery_count>=10:
   if recovery_ok<7:
    recovery_count=0
    recovery_ok=0
    feedback.text="❌ Menos de 7/10. Reintenta la reanimación."
   else:
    hero_hp=100.0 if recovery_ok==10 else 80.0
    recovery=false
    _bars()
    feedback.text="✨ Reanimado. Vida: %d%%"%int(hero_hp)
  _new_question()
  return
 if ok:
  hero_hp=min(100.0,hero_hp+10.0)
  _bars()
  world_stars += activity_stars
  activity_stars = 10
  feedback.text="✅ Correcto · +10% vida · "+str(current.tip)+" · Progreso: %d/60 ⭐"%world_stars
  if world_stars >= 60:
   msg.text="🏆 60 estrellas logradas · Generales ≥7/10 y prueba ≥8/10 desbloquean el siguiente mundo"
  _new_question()
 else:
  activity_stars=max(0,activity_stars-2)
  feedback.text="❌ Aún no · "+str(current.tip)+" · Actividad: %d/10 ⭐"%activity_stars

func _bars() -> void:
 hero_bar.value=hero_hp
 enemy_bar.value=enemy_hp

func _minimize() -> void:
 DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_MINIMIZED)

func _maximize() -> void:
 var mode: DisplayServer.WindowMode=DisplayServer.window_get_mode()
 if mode==DisplayServer.WINDOW_MODE_MAXIMIZED:
  DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
 else:
  DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_MAXIMIZED)

func _center_window() -> void:
 DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
 DisplayServer.window_set_size(Vector2i(1280,720))
 var screen: int=DisplayServer.window_get_current_screen()
 var screen_size: Vector2i=DisplayServer.screen_get_size(screen)
 DisplayServer.window_set_position((screen_size-Vector2i(1280,720))/2)

func _close() -> void:
 get_tree().quit()
