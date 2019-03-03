precision mediump float;
uniform float time;
// varying vec4 vDepthColor;
varying vec2 v_color_texture_coord;
uniform sampler2D color_texture;

void main(){
    // float t = time * 0.001;
    //gl_FragColor = vDepthColor;//vec4(0, vDepth, 0, 1);//vec4(vColor.r * abs(sin(t)), vColor.g * abs(cos(t)), vColor.b * abs(sin(t)), 1.0);
    if    (v_color_texture_coord.x <= 1.0
            && v_color_texture_coord.x >= 0.0
            && v_color_texture_coord.y <= 1.0
            && v_color_texture_coord.y >= 0.0) {
                gl_FragColor = texture2D(color_texture, v_color_texture_coord);
    } else {
                gl_FragColor = vec4(1.0, 0, 0, 1.0);
    }
}