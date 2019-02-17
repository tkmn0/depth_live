import * as THREE from "three";
import { ShaderLoader } from "../shader_loader"

export class TemplateScene {

    private renderer: THREE.Renderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    private box: THREE.Mesh;
    private pointCloudMaterial: THREE.ShaderMaterial;
    private pointCloudMesh: THREE.Points;

    constructor() {
        this.initialize();
        // this.addBox();
        this.addPointCloud();
        this.animate();
    }

    private async initialize() {

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
        this.camera.position.set(0, 0, 1000);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);
    }

    private addBox = () => {
        const geometry = new THREE.BoxGeometry(250, 250, 250);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.box = new THREE.Mesh(geometry, material);
        this.box.position.z = -5;
        this.scene.add(this.box);
    };

    private addPointCloud = async () => {

        let shaderLoader = new ShaderLoader();
        let shader = await shaderLoader.loadAsync('../lib/gl/pointcloud_example.vert', '../lib/gl/pointcloud_example.frag');

        const pointCloudGeometry = new THREE.BufferGeometry();
        let positions = [];
        let colors = [];
        let x, y, z;
        for (let i = 0; i < 640 * 480 * 3; i++) {
            x = Math.random() * 2.0 - 1.0;
            y = Math.random() * 2.0 - 1.0;
            z = Math.random() * 2.0 - 1.0;
            if (x * x + y * y + z * z <= 1) {
                positions.push(x * 500.0);
                positions.push(y * 10.0);
                positions.push(z * 500.0);
                colors.push(Math.random() * 255.0);
                colors.push(Math.random() * 255.0);
                colors.push(Math.random() * 255.0);
                colors.push(Math.random() * 255.0);
            }
        }

        let positionAttribyte = new THREE.Float32BufferAttribute(positions, 3);
        let colorAttribyte = new THREE.Uint8BufferAttribute(colors, 4);
        colorAttribyte.normalized = true;
        pointCloudGeometry.addAttribute('position', positionAttribyte);
        pointCloudGeometry.addAttribute('color', colorAttribyte);

        let shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "time": { value: 1.0 }
            },
            vertexShader: shader.Vert,
            fragmentShader: shader.Fragment,
            side: THREE.DoubleSide,
            transparent: true
        });

        let pointCloudMesh = new THREE.Points(pointCloudGeometry, shaderMaterial);
        this.scene.add(pointCloudMesh);
        this.pointCloudMesh = pointCloudMesh;
        this.pointCloudMaterial = shaderMaterial;

    }

    private animate() {
        const tick = (): void => {
            requestAnimationFrame(tick);

            this.box.rotation.x += 0.05;
            this.box.rotation.y += 0.05;

            let time = performance.now();
            if (this.pointCloudMaterial) {
                this.pointCloudMaterial.uniforms['time'].value = time;
                this.pointCloudMesh.rotation.x = (Math.cos(Math.PI * time * 0.1 / 360) * 0.05) + 0.1;
                this.pointCloudMesh.rotation.y += Math.PI / 720;
                this.renderer.render(this.scene, this.camera);
            }
        };
        tick();
    }
}