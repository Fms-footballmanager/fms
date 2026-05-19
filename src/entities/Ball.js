import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

const TMP_VECTOR = new THREE.Vector3();
const TMP_HORIZONTAL = new THREE.Vector3();

export class Ball {
  constructor() {
    this.radius = 1;
    this.groundY = this.radius;

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 })
    );
    this.mesh.position.set(0, this.groundY, 0);

    this.velocity = new THREE.Vector3();
    this.previousPosition = this.mesh.position.clone();
    this.lastTouch = null;
    this.maxSpeed = 62;
  }

  update(delta, player, input, world) {
    const safeDelta = Math.min(delta, 1 / 30);
    this.previousPosition.copy(this.mesh.position);

    this._handlePlayerCollision(player, input);
    this._integrate(safeDelta, world);
    this._rotateVisual(safeDelta);
  }

  _handlePlayerCollision(player, input) {
    const playerPos = player.mesh.position;
    const ballPos = this.mesh.position;

    TMP_HORIZONTAL.set(ballPos.x - playerPos.x, 0, ballPos.z - playerPos.z);
    const distance = Math.max(TMP_HORIZONTAL.length(), 0.0001);
    const directionFromPlayer = TMP_HORIZONTAL.clone().divideScalar(distance);

    const minDistance = this.radius + player.bodyRadius;
    const kickDistance = this.radius + player.kickRadius;
    const ballLowEnough = ballPos.y <= player.mesh.position.y + 1.8;

    const releasedPower = input.consumeKickRelease();
    if (releasedPower > 0 && distance <= kickDistance && ballLowEnough) {
      this._kick(player, releasedPower, directionFromPlayer);
      this.lastTouch = player;
      return;
    }

    if (distance < minDistance && ballLowEnough) {
      // Corrige a sobreposição para a bola não entrar dentro do jogador.
      const correction = minDistance - distance;
      ballPos.x += directionFromPlayer.x * correction;
      ballPos.z += directionFromPlayer.z * correction;

      const playerPush = Math.max(0, player.velocity.dot(directionFromPlayer));
      const impulse = 7.5 + playerPush * 0.55;

      this.velocity.x += directionFromPlayer.x * impulse;
      this.velocity.z += directionFromPlayer.z * impulse;
      this.velocity.y = Math.max(this.velocity.y, 1.2);
      this.lastTouch = player;
    }
  }

  _kick(player, power, directionFromPlayer) {
    const facing = player.facingDirection.clone();

    // Se o jogador estiver encostado na bola de lado/costas, usa a direção do contato
    // para evitar chute atravessando o corpo do jogador.
    const contactDot = facing.dot(directionFromPlayer);
    const kickDirection = contactDot > -0.15 ? facing : directionFromPlayer;
    kickDirection.y = 0;
    kickDirection.normalize();

    const strength = 22 + power * 16;
    this.velocity.x = kickDirection.x * strength + player.velocity.x * 0.2;
    this.velocity.z = kickDirection.z * strength + player.velocity.z * 0.2;
    this.velocity.y = 3.2 + power * 1.4;
  }

  _integrate(delta, world) {
    const steps = Math.max(1, Math.ceil(delta / (1 / 120)));
    const step = delta / steps;

    for (let i = 0; i < steps; i++) {
      this.velocity.y -= 28 * step;

      if (this.velocity.length() > this.maxSpeed) {
        this.velocity.setLength(this.maxSpeed);
      }

      this.mesh.position.addScaledVector(this.velocity, step);
      this._resolveGround();
      this._resolveFieldBounds(world?.bounds, world?.goals);

      const drag = this.mesh.position.y <= this.groundY + 0.02 ? 0.985 : 0.995;
      this.velocity.multiplyScalar(Math.pow(drag, step * 60));
    }
  }

  _resolveGround() {
    if (this.mesh.position.y < this.groundY) {
      this.mesh.position.y = this.groundY;

      if (Math.abs(this.velocity.y) < 1.8) {
        this.velocity.y = 0;
      } else {
        this.velocity.y *= -0.42;
      }
    }
  }

  _resolveFieldBounds(bounds, goals = []) {
    if (!bounds) return;

    const halfW = bounds.width / 2;
    const halfD = bounds.depth / 2;
    const minZ = -halfD + this.radius;
    const maxZ = halfD - this.radius;

    if (this.mesh.position.z < minZ) {
      this.mesh.position.z = minZ;
      this.velocity.z = Math.abs(this.velocity.z) * 0.72;
    } else if (this.mesh.position.z > maxZ) {
      this.mesh.position.z = maxZ;
      this.velocity.z = -Math.abs(this.velocity.z) * 0.72;
    }

    const isInsideAnyGoalMouth = goals.some(goal => goal.isInsideMouth(this.mesh.position, this.radius));
    const minX = -halfW + this.radius;
    const maxX = halfW - this.radius;

    if (!isInsideAnyGoalMouth) {
      if (this.mesh.position.x < minX) {
        this.mesh.position.x = minX;
        this.velocity.x = Math.abs(this.velocity.x) * 0.72;
      } else if (this.mesh.position.x > maxX) {
        this.mesh.position.x = maxX;
        this.velocity.x = -Math.abs(this.velocity.x) * 0.72;
      }
    }
  }

  _rotateVisual(delta) {
    TMP_VECTOR.set(this.velocity.z, 0, -this.velocity.x);
    const speed = TMP_VECTOR.length();
    if (speed > 0.05) {
      TMP_VECTOR.normalize();
      this.mesh.rotateOnWorldAxis(TMP_VECTOR, speed * delta / this.radius);
    }
  }

  reset(position = new THREE.Vector3(0, this.groundY, 0)) {
    this.mesh.position.copy(position);
    this.previousPosition.copy(position);
    this.velocity.set(0, 0, 0);
    this.lastTouch = null;
  }
}
