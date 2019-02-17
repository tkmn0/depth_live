precision mediump float;
attribute vec4 color;
uniform float time;
uniform sampler2D depth_texture;
uniform float width;
uniform float height;
varying vec4 vColor;
varying vec2 vUv;

void main(){
    vUv = vec2(position.x/ width, position.y/ height);
    vec4 depth_color = texture2D(depth_texture, vUv);
    vColor =depth_color;
    gl_PointSize = 1.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}