import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Goal {
  constructor(x) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(2, 6, 20),
      new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    );
    this.mesh.position.set(x, 3, 0);
  }

  checkGoal(ball) {
    if (
      Math.abs(ball.mesh.position.x - this.mesh.position.x) < 1 &&
      Math.abs(ball.mesh.position.z) < 10 &&
      ball.mesh.position.y < 5
    ) {
      console.log("⚽ GOOOOOL!");
      ball.mesh.position.set(0, 1, 0);
      ball.velocity.set(0, 0, 0);
    }
  }
}
