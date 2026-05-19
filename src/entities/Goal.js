import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";

export class Goal {
  constructor(x, side = x < 0 ? "left" : "right") {
    this.side = side;
    this.lineX = x;
    this.mouthHalfWidth = 12.5;
    this.crossbarHeight = 7.2;
    this.depth = 6;

    this.mesh = new THREE.Group();
    this.mesh.position.set(x, 0, 0);

    this._createFrame();
  }

  _createFrame() {
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const netMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    const postGeometry = new THREE.CylinderGeometry(0.14, 0.14, this.crossbarHeight, 12);
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(0, this.crossbarHeight / 2, -this.mouthHalfWidth);

    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(0, this.crossbarHeight / 2, this.mouthHalfWidth);

    const crossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, this.mouthHalfWidth * 2, 12),
      postMaterial
    );
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(0, this.crossbarHeight, 0);

    const net = new THREE.Mesh(
      new THREE.BoxGeometry(this.depth, this.crossbarHeight, this.mouthHalfWidth * 2),
      netMaterial
    );
    net.position.set(this.side === "left" ? -this.depth / 2 : this.depth / 2, this.crossbarHeight / 2, 0);

    this.mesh.add(leftPost, rightPost, crossbar, net);
  }

  isInsideMouth(position, ballRadius = 1) {
    return (
      Math.abs(position.z) <= this.mouthHalfWidth + ballRadius * 0.35 &&
      position.y <= this.crossbarHeight + ballRadius * 0.35
    );
  }

  checkGoal(ball) {
    const previousX = ball.previousPosition.x;
    const currentX = ball.mesh.position.x;

    const crossedLine = this.side === "left"
      ? previousX > this.lineX && currentX <= this.lineX
      : previousX < this.lineX && currentX >= this.lineX;

    const fullyBehindLine = this.side === "left"
      ? currentX <= this.lineX - ball.radius * 0.2
      : currentX >= this.lineX + ball.radius * 0.2;

    if ((crossedLine || fullyBehindLine) && this.isInsideMouth(ball.mesh.position, ball.radius)) {
      return true;
    }

    return false;
  }
}
