import * as THREE from "three";
import { ShaderLoader } from "../shader_loader"

export class TemplateScene {

    private renderer: THREE.Renderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    private box: THREE.Mesh;

    constructor() {
        this.initialize();
        this.animate();
    }

    private async initialize() {

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
        this.camera.position.set(0, 0, 1000);

        const geometry = new THREE.BoxGeometry(250, 250, 250);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.box = new THREE.Mesh(geometry, material);
        this.box.position.z = -5;
        this.scene.add(this.box);

        let shaderLoader = new ShaderLoader();
        let shader = await shaderLoader.loadAsync('../lib/gl/test.vert', null);
        console.log(shader.Vert);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);
    }

    private animate() {
        const tick = (): void => {
            requestAnimationFrame(tick);

            this.box.rotation.x += 0.05;
            this.box.rotation.y += 0.05;

            // 描画
            this.renderer.render(this.scene, this.camera);
        };
        tick();
    }
}