import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Ball {
  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    this.mesh.position.set(0, 1, 0);

    this.velocity = new THREE.Vector3();
  }

  update(delta, player) {
    const dist = this.mesh.position.distanceTo(player.mesh.position);

    if (dist < 3 && player.mesh.position.z < this.mesh.position.z) {
      this.velocity.z -= 35 * delta;
      this.velocity.y += 15 * delta;
    }

    this.velocity.y -= 25 * delta;
    this.mesh.position.addScaledVector(this.velocity, delta);

    if (this.mesh.position.y < 1) {
      this.mesh.position.y = 1;
      this.velocity.y *= -0.5;
    }

    this.velocity.multiplyScalar(0.98);
  }
}
