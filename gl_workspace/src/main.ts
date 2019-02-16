import { TemplateScene } from "./template_scene/template_scene";

class Main {

    constructor() {
        console.log('initialize template scene...');
        let template = new TemplateScene();
    }
}

let main: Main
window.onload = () => {
    main = new Main();
};