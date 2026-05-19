import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import { Input } from "./Input.js";
import { Player } from "./entities/Player.js";
import { Ball } from "./entities/Ball.js";
import { Goal } from "./entities/Goal.js";
import { CameraSystem } from "./CameraSystem.js";

export class Game {
  constructor() {
    this.bounds = { width: 120, depth: 80 };
    this.score = { player: 0, opponent: 0 };
    this.goalLock = false;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a7a3d);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.display = "block";
    document.body.appendChild(this.renderer.domElement);

    this.input = new Input();
    this.clock = new THREE.Clock();

    this.player = new Player();
    this.ball = new Ball();

    this.goalLeft = new Goal(-this.bounds.width / 2 + 5, "left");
    this.goalRight = new Goal(this.bounds.width / 2 - 5, "right");
    this.goals = [this.goalLeft, this.goalRight];

    this.cameraSystem = new CameraSystem(this.camera, this.ball.mesh);

    this.scene.add(
      this.player.mesh,
      this.ball.mesh,
      this.goalLeft.mesh,
      this.goalRight.mesh
    );

    this.createField();
    this.createHud();
    this.onResize();
    window.addEventListener("resize", () => this.onResize());
  }

  createField() {
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(this.bounds.width, this.bounds.depth),
      new THREE.MeshStandardMaterial({ color: 0x1c9c4a, roughness: 0.9 })
    );
    field.rotation.x = -Math.PI / 2;
    this.scene.add(field);

    this._createFieldLines();

    const light = new THREE.DirectionalLight(0xffffff, 1.25);
    light.position.set(50, 100, 50);
    this.scene.add(light);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  }

  _createFieldLines() {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const halfW = this.bounds.width / 2;
    const halfD = this.bounds.depth / 2;
    const y = 0.035;

    const addLine = points => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      this.scene.add(new THREE.Line(geometry, material));
    };

    addLine([
      new THREE.Vector3(-halfW, y, -halfD),
      new THREE.Vector3(halfW, y, -halfD),
      new THREE.Vector3(halfW, y, halfD),
      new THREE.Vector3(-halfW, y, halfD),
      new THREE.Vector3(-halfW, y, -halfD)
    ]);

    addLine([new THREE.Vector3(0, y, -halfD), new THREE.Vector3(0, y, halfD)]);

    const circlePoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      circlePoints.push(new THREE.Vector3(Math.cos(angle) * 8, y, Math.sin(angle) * 8));
    }
    addLine(circlePoints);
  }

  createHud() {
    this.hud = document.createElement("div");
    this.hud.style.position = "fixed";
    this.hud.style.left = "16px";
    this.hud.style.top = "16px";
    this.hud.style.padding = "10px 14px";
    this.hud.style.borderRadius = "10px";
    this.hud.style.background = "rgba(0,0,0,0.55)";
    this.hud.style.color = "white";
    this.hud.style.font = "bold 18px Arial, sans-serif";
    this.hud.style.zIndex = "10";
    this.hud.style.userSelect = "none";
    document.body.appendChild(this.hud);
    this.updateHud();
  }

  updateHud(message = "") {
    this.hud.innerHTML = `Você ${this.score.player} x ${this.score.opponent} Adversário<br><span style="font-size:12px;font-weight:400">WASD move • segure Espaço e solte para chutar${message ? ` • ${message}` : ""}</span>`;
  }

  start() {
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 1 / 30);

    this.input.update(delta);
    this.player.update(this.input, delta, this.bounds);
    this.ball.update(delta, this.player, this.input, {
      bounds: this.bounds,
      goals: this.goals
    });

    this.checkGoals();
    this.cameraSystem.update();

    this.renderer.render(this.scene, this.camera);
  }

  checkGoals() {
    if (this.goalLock) return;

    if (this.goalRight.checkGoal(this.ball)) {
      this.registerGoal("player");
    } else if (this.goalLeft.checkGoal(this.ball)) {
      this.registerGoal("opponent");
    }
  }

  registerGoal(team) {
    this.goalLock = true;
    this.score[team] += 1;
    this.updateHud(team === "player" ? "GOOOOL!" : "Gol do adversário");

    window.setTimeout(() => {
      this.resetAfterGoal(team);
      this.goalLock = false;
      this.updateHud();
    }, 700);
  }

  resetAfterGoal(teamThatScored) {
    this.ball.reset(new THREE.Vector3(0, 1, 0));

    const playerX = teamThatScored === "player" ? -18 : 18;
    this.player.reset(new THREE.Vector3(playerX, 2, 0));
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
