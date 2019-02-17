import * as THREE from 'three';
import { DepthCamera } from "../depth_camera/realsense/depth_camera";
const OrbitControls = require("three-orbitcontrols");

export class PointCloudScene {

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private buffer: Uint16Array;
    private dataTexture: THREE.DataTexture;

    constructor() {
        this.setupScene();
    }

    private setupScene = () => {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(800, 600);
        this.renderer.domElement.id = 'point_cloud';
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, 800 / 600, 1, 10000);
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

        this.dataTexture = new THREE.DataTexture(this.buffer, 640, 480, THREE.RGBAFormat);
        this.dataTexture.type = THREE.UnsignedShort4444Type.valueOf();
        this.dataTexture.needsUpdate = true;

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(640, 480, 1, 1),
            new THREE.MeshBasicMaterial({
                map: this.dataTexture,
                side: THREE.FrontSide
            })
        );

        this.scene.add(plane);
        plane.position.z = -500;
        console.log(plane.position);

        let width = 640;
        let height = 480;
        var nearClipping = 850;
        let farClipping = 4000;
        let parameters = DepthCamera.getCameraCalibration(null, 'D415');
        let depthIntrinsics = parameters.getDepthIntrinsics(width, height);
        let depth_forcal_length = depthIntrinsics.focalLength;
        let depth_offset = depthIntrinsics.offset;
        let depth_scale = parameters.depthScale;
        let depth_distortion_model = parameters.depthDistortionModel;
        let depth_distortion_coeffs = parameters.depthDistortioncoeffs;
        let color_focal_length = parameters.colorFocalLength;
        let color_offset = parameters.colorOffset;
        let color_distortion_model = parameters.colorDistortionModel;
        let color_distortion_coeffs = parameters.colorDistortioncoeffs;
        let depth_to_color = parameters.depthToColor;

        console.log(depth_forcal_length);
        console.log(depth_offset);
        console.log(depth_distortion_model);
        console.log(depth_distortion_coeffs);
        console.log(color_focal_length);
        console.log(color_offset);
        console.log(color_distortion_model);
        console.log(color_distortion_coeffs);
        console.log(depth_to_color);
        console.log('depth_scale', depth_scale);

        var ParamsShaderMaterial = {
            uniforms: {
                "u_depth_to_color": { value: depth_to_color },
                "u_depth_scale": { value: depth_scale },
                "u_depth_offset": { value: depth_offset },
                "u_depth_focal_length": { value: depth_forcal_length },
                "u_depth_distortion_model": { value: depth_distortion_model },
                "u_depth_distortion_coeffs": { value: depth_distortion_coeffs },
                "u_color_offset": { vlue: color_offset },
                "u_color_focal_length": { value: color_focal_length },
                "u_color_distortion_model": { value: color_distortion_model },
                "u_color_distortion_coeffs": { value: color_distortion_coeffs },
                "u_depth_texture": { value: this.dataTexture },
                "u_depth_texture_size": { value: [width, height] },
                "u_color_texture_size": { value: [width, height] },
                "nearClipping": { value: nearClipping },
                "farClipping": { value: farClipping }
            },
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
            side: THREE.DoubleSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
        };

        let glGeometry = new THREE.BufferGeometry();

        var vertices = new Float32Array(width * height * 3);
        for (var i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
            vertices[i] = j % width;
            vertices[i + 1] = Math.floor(j / width);
        }
        glGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));

        let glMaterial = new THREE.ShaderMaterial(ParamsShaderMaterial);

        let glMesh = new THREE.Points(glGeometry, glMaterial);
        glMesh.scale.set(200.0, 200.0, 200.0);
        this.scene.add(glMesh);

        const tick = (): void => {
            requestAnimationFrame(tick);

            controls.update();
            camera.updateProjectionMatrix();
            this.renderer.render(this.scene, camera);
        };
        tick();
    };

    updateTexture = (data: Uint16Array) => {
        this.buffer.set(data);
        this.dataTexture.needsUpdate = true;
    };
}