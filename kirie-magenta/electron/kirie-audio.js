// Audio adaptativo para frontend Electron/Three.js.
// Requiere un gesto de usuario inicial para desbloquear audio en Chromium.
export class KirieAudio {
  constructor(base = "./audio/") {
    this.base = base;
    this.player = new Audio();
    this.player.loop = true;
    this.player.volume = 0.4;
    this.state = "";
    this.narration = false;
    this.states = new Set(["exploracion", "combate", "evaluacion", "victoria"]);
  }
  async setState(state) {
    if (!this.states.has(state) || this.state === state) return;
    this.state = state;
    this.player.pause();
    this.player.src = this.base + state + ".ogg";
    this.player.loop = state !== "victoria";
    this.player.load();
    this.player.volume = this.narration ? 0.08 : 0.4;
    try { await this.player.play(); }
    catch (error) { console.warn("Audio requiere interacción o falta pista:", error); }
  }
  setNarration(active) {
    this.narration = Boolean(active);
    this.player.volume = this.narration ? 0.08 : 0.4;
  }
  stop() {
    this.player.pause();
    this.player.currentTime = 0;
    this.state = "";
  }
}
