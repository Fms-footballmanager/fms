export class Input {
  constructor() {
    this.keys = {};
    this.kickPower = 0;

    window.addEventListener("keydown", e => {
      this.keys[e.code] = true;
    });

    window.addEventListener("keyup", e => {
      this.keys[e.code] = false;
      if (e.code === "Space") this.kickPower = 0;
    });
  }

  get forward() {
    return this.keys["KeyW"];
  }

  get backward() {
    return this.keys["KeyS"];
  }

  get left() {
    return this.keys["KeyA"];
  }

  get right() {
    return this.keys["KeyD"];
  }

  chargeKick() {
    this.kickPower = Math.min(this.kickPower + 0.04, 2.5);
    return this.kickPower;
  }

  kickReleased() {
    return !this.keys["Space"] && this.kickPower > 0;
  }
}
