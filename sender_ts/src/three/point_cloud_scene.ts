import * as THREE from 'three';

export class PointCloudScene {

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;

    constructor() {
        this.setupScene();
    }

    private setupScene = () => {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        this.renderer.domElement.id = 'point_cloud';
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
        camera.position.set(0, 0, 1000);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(640, 480, 1, 1),
            new THREE.MeshLambertMaterial({
                color: 0x0000ff
            })
        );

        this.scene.add(plane);

        const tick = (): void => {
            requestAnimationFrame(tick);

            // 描画
            this.renderer.render(this.scene, camera);
        };
        tick();
    };
}