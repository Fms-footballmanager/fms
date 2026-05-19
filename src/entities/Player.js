import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Player {
  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(1, 2, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x0033ff })
    );

    this.mesh.position.set(-18, 2, 0);

    this.speed = 22;
    this.acceleration = 65;
    this.friction = 16;
    this.bodyRadius = 1.45;
    this.kickRadius = 3.35;
    this.velocity = new THREE.Vector3();
    this.facingDirection = new THREE.Vector3(1, 0, 0);
  }

  update(input, delta, bounds) {
    const desiredDirection = new THREE.Vector3();

    if (input.forward) desiredDirection.z -= 1;
    if (input.backward) desiredDirection.z += 1;
    if (input.left) desiredDirection.x -= 1;
    if (input.right) desiredDirection.x += 1;

    if (desiredDirection.lengthSq() > 0) {
      desiredDirection.normalize();
      this.facingDirection.copy(desiredDirection);

      const desiredVelocity = desiredDirection.multiplyScalar(this.speed);
      this.velocity.lerp(desiredVelocity, Math.min(1, this.acceleration * delta / this.speed));
    } else {
      this.velocity.lerp(new THREE.Vector3(0, 0, 0), Math.min(1, this.friction * delta));
    }

    this.mesh.position.addScaledVector(this.velocity, delta);

    if (bounds) {
      const minX = -bounds.width / 2 + this.bodyRadius;
      const maxX = bounds.width / 2 - this.bodyRadius;
      const minZ = -bounds.depth / 2 + this.bodyRadius;
      const maxZ = bounds.depth / 2 - this.bodyRadius;

      this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, minX, maxX);
      this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, minZ, maxZ);
    }
  }

  reset(position = new THREE.Vector3(-18, 2, 0)) {
    this.mesh.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.facingDirection.set(1, 0, 0);
  }
}
