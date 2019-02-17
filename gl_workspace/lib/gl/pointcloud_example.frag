precision mediump float;
uniform float time;
varying vec4 vColor;
varying float vDepth;

void main(){
    float t = time * 0.001;
    gl_FragColor = vec4(0, vDepth, 0, 1);//vec4(vColor.r * abs(sin(t)), vColor.g * abs(cos(t)), vColor.b * abs(sin(t)), 1.0);
}