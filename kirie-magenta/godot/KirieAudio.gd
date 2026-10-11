extends Node
## Autoload: KirieAudio. Godot 4.x.
var player: AudioStreamPlayer
var current_state := ""
var narration := false
var normal_volume_db := -8.0
var narration_volume_db := -25.0
const TRACKS := {
    "exploracion": "res://audio/exploracion.ogg",
    "combate": "res://audio/combate.ogg",
    "evaluacion": "res://audio/evaluacion.ogg",
    "victoria": "res://audio/victoria.ogg"
}

func _ready() -> void:
    player = AudioStreamPlayer.new()
    player.bus = "Master"
    add_child(player)
    player.finished.connect(_on_finished)
    _apply_volume()

func set_state(state: String) -> void:
    if not TRACKS.has(state) or state == current_state:
        return
    current_state = state
    var path: String = TRACKS[state]
    if not ResourceLoader.exists(path):
        push_warning("KirieAudio: pista no encontrada: " + path)
        player.stop()
        return
    player.stream = load(path)
    player.play()
    _apply_volume()

func set_narration(active: bool) -> void:
    narration = active
    _apply_volume()

func _apply_volume() -> void:
    if player:
        player.volume_db = narration_volume_db if narration else normal_volume_db

func _on_finished() -> void:
    if current_state != "victoria" and player.stream:
        player.play()
