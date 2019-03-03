import * as THREE from 'three';
import { DepthCamera } from "../depth_camera/realsense/depth_camera";
const OrbitControls = require("three-orbitcontrols");
import { ShaderLoader } from "./shader/shader_loader";

export class PointCloudScene {

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private buffer: Uint16Array;
    private depthTexture: THREE.DataTexture;
    private colorTexture: THREE.CanvasTexture;

    constructor() {
        this.setupScene();

        this.addPointCloud();
    }

    public setupColorCanvas = (colorCanvas: HTMLCanvasElement) => {
        this.colorTexture = new THREE.CanvasTexture(colorCanvas);
        this.colorTexture.needsUpdate = true;
        this.colorTexture.minFilter = THREE.LinearFilter;
        this.colorTexture.format = THREE.RGBAFormat;
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(640, 480, 1, 1),
            new THREE.MeshBasicMaterial({
                map: this.colorTexture,
                side: THREE.DoubleSide
            })
        );
        this.scene.add(plane);
        plane.position.z = -500;
    };

    private addPointCloud = async () => {

        let shaderLoader = new ShaderLoader();
        let shader = await shaderLoader.loadAsync('../lib/gl/pointcloud_example.vert', '../lib/gl/pointcloud_example.frag');
        let width = 640;
        let height = 480;

        const pointCloudGeometry = new THREE.BufferGeometry();
        let positions = new Float32Array(width * height * 3);
        let indices = [];
        let colors = [];
        for (let i = 0; i < 640 * 480 * 3; i++) {
            colors.push(Math.random() * 255.0);
            colors.push(Math.random() * 255.0);
            colors.push(Math.random() * 255.0);
            colors.push(Math.random() * 255.0);
        }
        for (var i = 0, j = 0, l = positions.length; i < l; i += 3, j++) {

            positions[i] = 0;//j % 640; // x
            positions[i + 1] = Math.floor(j / 640); // y
            positions[i + 2] = 0; // z
        }

        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                indices.push(i);
                indices.push(j);
            }
        }

        let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
        let colorAttribute = new THREE.Uint8BufferAttribute(colors, 4);
        let indicesAttribute = new THREE.Float32BufferAttribute(indices, 2);
        colorAttribute.normalized = true;
        pointCloudGeometry.addAttribute('position', positionAttribute);
        pointCloudGeometry.addAttribute('color', colorAttribute);
        pointCloudGeometry.addAttribute('depth_texture_index', indicesAttribute);

        let shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                "time": { value: 1.0 },
                "depth_texture": { value: this.depthTexture },
                "color_texture": { value: this.colorTexture },
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
        // pointCloudMesh.rotateZ(Math.PI);
    }

    private setupScene = () => {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        this.renderer.domElement.id = 'point_cloud';
        this.renderer.setClearColor(0xf8f8f8);
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 10000);
        camera.position.set(0, 0, 1);
        let center = new THREE.Vector3();
        center.z = - 1000;
        camera.lookAt(center);

        let controls = new OrbitControls(camera, this.renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1);
        this.scene.add(light);

        this.buffer = new Uint16Array(640 * 480);
        for (var i = 0; i < this.buffer.length; i++) {
            this.buffer[i] = Math.random() * 65535
        }

        this.depthTexture = new THREE.DataTexture(this.buffer, 640, 480, THREE.RGBAFormat);
        this.depthTexture.type = THREE.UnsignedShort4444Type.valueOf();
        this.depthTexture.minFilter = THREE.NearestFilter;
        this.depthTexture.needsUpdate = true;

        const tick = (): void => {
            requestAnimationFrame(tick);

            if (this.colorTexture) {
                this.colorTexture.needsUpdate = true;
            }
            controls.update();
            camera.updateProjectionMatrix();
            this.renderer.render(this.scene, camera);
        };
        tick();
    };

    updateTexture = (data: Uint16Array) => {
        this.buffer.set(data);
        this.depthTexture.needsUpdate = true;
    };
}