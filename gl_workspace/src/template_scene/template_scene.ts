import * as THREE from "three";
import { ShaderLoader } from "../shader_loader"
const OrbitControls = require("three-orbitcontrols");
const fs = require('fs');

export class TemplateScene {

    private renderer: THREE.Renderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private constrols: any;

    private box: THREE.Mesh;
    private pointCloudMaterial: THREE.ShaderMaterial;
    private pointCloudMesh: THREE.Points;

    private buffer: Uint16Array;
    private dataTexture: THREE.DataTexture;

    constructor() {


        let img = document.getElementById('depth_rgba') as HTMLImageElement;
        img.hidden = true;
        let canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 320;
        let context = canvas.getContext('2d');
        context.drawImage(img, 0, 0);
        let imageData = context.getImageData(0, 0, 480, 320);
        const data = imageData.data;

        const pixel: Uint8Array = new Uint8Array(data.buffer);
        const rawDepth: Uint16Array = new Uint16Array(640 * 480);
        const upper = new Uint8Array(rawDepth.length);
        const lower = new Uint8Array(rawDepth.length);

        for (let i = 0; i < pixel.length; i += 4) {
            let r = pixel[i];
            let g = pixel[i + 1];
            let b = pixel[i + 2];
            let a = pixel[i + 3];

            upper[i / 2] = r;
            lower[i / 2] = g;
            upper[i / 2 + 1] = b;
            lower[i / 2 + 1] = a;

        }

        for (let i = 0; i < upper.length; i += 1) {
            rawDepth[i] = (upper[i] << 8) + lower[i];
        }
        this.buffer = new Uint16Array(rawDepth);

        this.initialize();
        // this.addBox();
        this.setupDepthTexture();
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
        this.constrols = new OrbitControls(this.camera);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);
    }

    private setupDepthTexture = () => {
        // this.buffer = new Uint16Array(640 * 480);
        // for (var i = 0; i < this.buffer.length; i++) {
        //     this.buffer[i] = Math.random() * 65535
        // }
        this.dataTexture = new THREE.DataTexture(this.buffer, 640, 480, THREE.RGBAFormat);
        this.dataTexture.type = THREE.UnsignedShort4444Type.valueOf();
        this.dataTexture.needsUpdate = true;

        // const plane = new THREE.Mesh(
        //     new THREE.PlaneGeometry(640, 480, 1, 1),
        //     new THREE.MeshBasicMaterial({
        //         map: this.dataTexture,
        //         side: THREE.FrontSide
        //     })
        // );
        // this.scene.add(plane);
    };


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
        let width = 640;
        let height = 480;

        const pointCloudGeometry = new THREE.BufferGeometry();
        let positions = new Float32Array(width * height * 3);
        let colors = [];
        for (let i = 0; i < 640 * 480 * 3; i++) {
            colors.push(Math.random() * 255.0);
            colors.push(Math.random() * 255.0);
            colors.push(Math.random() * 255.0);
            colors.push(Math.random() * 255.0);
        }

        for (var i = 0, j = 0, l = positions.length; i < l; i += 3, j++) {

            positions[i] = j % 640; // x
            positions[i + 1] = Math.floor(j / 640); // y
            positions[i + 2] = 0; // z
        }

        let positionAttribyte = new THREE.Float32BufferAttribute(positions, 3);
        let colorAttribyte = new THREE.Uint8BufferAttribute(colors, 4);
        colorAttribyte.normalized = true;
        pointCloudGeometry.addAttribute('position', positionAttribyte);
        pointCloudGeometry.addAttribute('color', colorAttribyte);

        let shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "time": { value: 1.0 },
                "depth_texture": { value: this.dataTexture },
                "width": { value: 640 },
                "height": { value: 480 }
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

            if (this.box) {
                this.box.rotation.x += 0.05;
                this.box.rotation.y += 0.05;
            }

            let time = performance.now();
            if (this.pointCloudMaterial && this.pointCloudMesh) {
                this.pointCloudMaterial.uniforms['time'].value = time;
                // this.pointCloudMesh.rotation.x = (Math.cos(Math.PI * time * 0.1 / 360) * 0.05) + 0.1;
                // this.pointCloudMesh.rotation.y += Math.PI / 720;
            }
            this.constrols.update();
            this.renderer.render(this.scene, this.camera);
        };
        tick();
    }
}