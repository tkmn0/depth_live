precision mediump float;
attribute vec4 color;
attribute vec2 depth_texture_index;
uniform float time;
uniform sampler2D depth_texture;
uniform float width;
uniform float height;
varying vec4 vColor;
varying float vDepth;
varying vec2 vUv;
const float XtoZ = 1.11146; // tan( 1.0144686 / 2.0 ) * 2.0;
const float YtoZ = 0.83359; // tan( 0.7898090 / 2.0 ) * 2.0;

void main(){
    /*
    vUv = vec2(position.x/ width, position.y/ height);
    vec4 depth_color = texture2D(depth_texture, vUv);
    vColor = depth_color;
    // float depth = (depth_color.w + depth_color.z * 16.0+ depth_color.y * 16.0 * 16.0 + depth_color.x * 16.0 * 16.0 * 16.0);
    float depth = ( depth_color.x + depth_color.y + depth_color.z ) / 3.0 * 10.0;
    // float depth = (depth_color.x + depth_color.y + depth_color.z + depth_color.w) * 10.0;
    float z = ( 1.0 - depth ) * (3664.0 - 1.0) + 1.0;
    // float x = position.x;
    // float y = position.y;
    // float z = depth;
    vec4 pos = vec4(( position.x / width - 0.5 ) * z * XtoZ, ( position.y / height - 0.5 ) * z * YtoZ, - z + 2333.0, 1.0);
    // vec4 pos = vec4(x, y, z, 1.0);
    gl_PointSize = 1.5;
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    */

    vUv = vec2(position.x/ width, position.y/ height);
    vec2 depth_texture_coord = depth_texture_index / width;
    vec4 color = texture2D(depth_texture, vUv);
    float depth = (color.w + color.z * 16.0+ color.y * 16.0 * 16.0 + color.x * 16.0 * 16.0 * 16.0);
    vDepth = depth/255.0;
    vColor = color;
    gl_PointSize = 1.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
}