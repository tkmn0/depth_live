import * as THREE from "three";
import { ShaderEntity } from "./shader_entity";

export class ShaderLoader {
    constructor() {

    }

    loadAsync = async (vertex_url: string, fragment_url?: string): Promise<ShaderEntity> => {
        return new Promise<ShaderEntity>((resolve, reject) => {
            let vertex_loader = new THREE.FileLoader();
            vertex_loader.load(vertex_url, (vertex_shader: string) => {

                let shader = new ShaderEntity();
                shader.Vert = vertex_shader;
                let fragment_loader = new THREE.FileLoader();
                if (fragment_url) {
                    fragment_loader.load(fragment_url, (fragment_shader: string) => {
                        shader.Fragment = fragment_shader;
                        resolve(shader);
                    }, (progress) => {
                    }, (err) => {
                        reject(err);
                    });
                } else {
                    resolve(shader);
                }
            }, (progress) => {

            }, (err) => {
                reject(err);
            });
        });
    }
}