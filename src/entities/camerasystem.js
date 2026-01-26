import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class CameraSystem {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
  }

  update() {
    const desired = new THREE.Vector3(
      this.target.position.x,
      this.target.position.y + 25,
      this.target.position.z + 30
    );

    this.camera.position.lerp(desired, 0.08);
    this.camera.lookAt(this.target.position);
  }
}
