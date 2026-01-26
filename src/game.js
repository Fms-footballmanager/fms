import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import { Input } from "./Input.js";
import { Player } from "./entities/Player.js";
import { Ball } from "./entities/Ball.js";
import { Goal } from "./entities/Goal.js";
import { CameraSystem } from "./CameraSystem.js";

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a7a3d);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.input = new Input();
    this.clock = new THREE.Clock();

    this.player = new Player();
    this.ball = new Ball();

    this.goalLeft = new Goal(-55);
    this.goalRight = new Goal(55);

    this.cameraSystem = new CameraSystem(this.camera, this.ball.mesh);

    this.scene.add(
      this.player.mesh,
      this.ball.mesh,
      this.goalLeft.mesh,
      this.goalRight.mesh
    );

    this.createField();
  }

  createField() {
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 80),
      new THREE.MeshStandardMaterial({ color: 0x1c9c4a })
    );
    field.rotation.x = -Math.PI / 2;
    this.scene.add(field);

    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(50, 100, 50);
    this.scene.add(light);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  }

  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    this.player.update(this.input, delta);
    this.ball.update(delta, this.player);

    this.goalLeft.checkGoal(this.ball);
    this.goalRight.checkGoal(this.ball);

    this.cameraSystem.update();

    this.renderer.render(this.scene, this.camera);
  }
}
