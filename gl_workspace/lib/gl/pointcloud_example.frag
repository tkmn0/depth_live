precision mediump float;
uniform float time;
varying vec4 vColor;

void main(){
    float t = time * 0.001;
    gl_FragColor = vec4(vColor.r * abs(sin(t)), vColor.g * abs(cos(t)), vColor.b * abs(sin(t)), 1.0);
}