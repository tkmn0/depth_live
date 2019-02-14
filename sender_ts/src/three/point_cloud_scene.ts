import * as THREE from 'three';

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

        const camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 10000);
        camera.position.set(0, 0, 1000);

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

        /*
        var ParamsShaderMaterial = {
            uniforms: {
                "time": { value: 1.0 }
            },
            vertexShader: [
                "precision mediump float;",
                "attribute vec4 color;",
                "uniform float time;",
                "varying vec4 vColor;",
                "void main() {",
                "vColor = color;",
                "gl_PointSize = 1.5;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "}"
            ].join("\n"),
            fragmentShader: [
                "precision mediump float;",
                "uniform float time;",
                "varying vec4 vColor;",
                "void main() {",
                "float t = time * 0.001;",
                "gl_FragColor = vec4( vColor.r * abs(sin(t)), vColor.g * abs(cos(t)), vColor.b * abs(sin(t)), 1.0 );",
                "}"
            ].join("\n"),
            side: THREE.DoubleSide,
            transparent: true
        };

        let particles = 300000;
        let glGeometry = new THREE.BufferGeometry();
        let positions = [];
        let colors = [];
        let x, y, z;
        for (let i = 0; i < particles; i++) {
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

        let positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
        let colorAttribute = new THREE.Uint8BufferAttribute(colors, 4);
        colorAttribute.normalized = true;
        glGeometry.addAttribute('position', positionAttribute);
        glGeometry.addAttribute('color', colorAttribute);
        let glMaterial = new THREE.ShaderMaterial(ParamsShaderMaterial);
        
        let glMesh = new THREE.Points(glGeometry, glMaterial);
        this.scene.add(glMesh);
        */

        const tick = (): void => {
            requestAnimationFrame(tick);

            // 描画
            this.renderer.render(this.scene, camera);
        };
        tick();
    };

    updateTexture = (data: Uint16Array) => {
        this.buffer.set(data);
        this.dataTexture.needsUpdate = true;
    };
}