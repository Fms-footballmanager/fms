export class Input {
  constructor() {
    this.keys = {};
    this.kickPower = 0;
    this.pendingKickPower = 0;
    this.maxKickPower = 2.5;
    this.kickChargePerSecond = 1.65;

    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("keydown", event => {
      this.keys[event.code] = true;

      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(event.code)) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", event => {
      this.keys[event.code] = false;

      if (event.code === "Space") {
        // Guarda a força no momento em que o jogador solta o botão.
        // Antes o código zerava kickPower aqui, então o chute era perdido.
        this.pendingKickPower = Math.max(this.kickPower, 0.35);
        this.kickPower = 0;
        event.preventDefault();
      }
    });
  }

  update(delta) {
    if (this.keys["Space"]) {
      this.kickPower = Math.min(
        this.kickPower + this.kickChargePerSecond * delta,
        this.maxKickPower
      );
    }
  }

  get forward() {
    return !!this.keys["KeyW"];
  }

  get backward() {
    return !!this.keys["KeyS"];
  }

  get left() {
    return !!this.keys["KeyA"];
  }

  get right() {
    return !!this.keys["KeyD"];
  }

  get isChargingKick() {
    return !!this.keys["Space"];
  }

  consumeKickRelease() {
    const power = this.pendingKickPower;
    this.pendingKickPower = 0;
    return power;
  }
}
