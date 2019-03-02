precision mediump float;
uniform float time;
varying float vDepth;
varying vec4 vDepthColor;
varying float r_value;

void main(){
    float t = time * 0.001;
    gl_FragColor = vDepthColor;//vec4(0, vDepth, 0, 1);//vec4(vColor.r * abs(sin(t)), vColor.g * abs(cos(t)), vColor.b * abs(sin(t)), 1.0);
}