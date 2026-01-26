import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Player {
  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(1, 2, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x0033ff })
    );
    this.mesh.position.y = 2;
    this.speed = 20;
  }

  update(input, delta) {
    const dir = new THREE.Vector3();

    if (input.forward) dir.z -= 1;
    if (input.backward) dir.z += 1;
    if (input.left) dir.x -= 1;
    if (input.right) dir.x += 1;

    dir.normalize();
    this.mesh.position.addScaledVector(dir, this.speed * delta);
  }
}
