precision mediump float;
attribute vec4 color;
attribute vec2 depth_texture_index;
uniform float time;
uniform sampler2D depth_texture;
varying float vDepth;
varying vec4 vDepthColor;
const vec2 u_depth_offset = vec2(315.847442626953, 241.684616088867);
const vec2 u_depth_focal_length = vec2(643.142272949219, 643.142272949219);
const float u_depth_scale = 0.00100000005;
varying float r_value;

vec4 depth_deproject(vec2 index, float depth) {
   vec2 position2d = (index - u_depth_offset) / u_depth_focal_length;
   return vec4(position2d * depth, depth, 1.0);
}

void main(){

    // pixel 1pixelだけつかう
    // 赤だけを表示して確認する
    vec2 depth_texture_coord = depth_texture_index / vec2(640, 480);
    vec4 color= texture2D(depth_texture, depth_texture_coord);
    float depth = color.x * 16.0 * 16.0 * 16.0 + color.y * 16.0 * 16.0 + color.z * 16.0 + color.w;//color.w * 8.0 * 8.0 * 8.0 + color.z * 8.0 * 8.0 + color.y * 8.0 + color.x;//(color.w + color.z * 16.0+ color.y * 16.0 * 16.0 + color.x * 16.0 * 16.0 * 16.0);
    
    float depth_scaled = u_depth_scale * depth * 10.0;
    vDepth = depth_scaled;
    vDepthColor = color;
    
    vec4 pos = depth_deproject(depth_texture_index, depth_scaled);
    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * pos;
}