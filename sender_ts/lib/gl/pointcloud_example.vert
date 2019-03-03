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
const mat4 u_depth_to_color = mat4(0.999988317489624, 0.000353455223375931, -0.00482225976884365, 0, -0.000426474376581609, 0.999885141849518, -0.0151494843885303, 0, 0.00481635145843029, 0.0151513637974858, 0.999873638153076, 0, 0.0150465695187449, -0.0000645012842142023, -0.00031321871210821, 1.0);
const vec2 u_color_focal_length = vec2(617.459838867188, 617.65087890625);
const vec2 u_color_offset = vec2(321.308288574219, 231.349639892578);
varying vec2 v_color_texture_coord;

vec4 depth_deproject(vec2 index, float depth) {
   vec2 position2d = (index - u_depth_offset) / u_depth_focal_length;
   return vec4(position2d * depth, depth, 1.0);
}

vec2 color_project(vec4 position3d) {
    vec2 position2d = position3d.xy / position3d.z;
    return position2d * u_color_focal_length + u_color_offset;
}

void main(){

    vec2 depth_texture_coord = depth_texture_index / vec2(640, 480);
    vec4 color= texture2D(depth_texture, depth_texture_coord);
    float depth = color.x * 16.0 * 16.0 * 16.0 + color.y * 16.0 * 16.0 + color.z * 16.0 + color.w;
    
    float depth_scaled = u_depth_scale * depth * 10.0;
    vDepth = depth_scaled;
    vDepthColor = color;
    
    vec4 pos = depth_deproject(depth_texture_index, depth_scaled);
    pos.y *= -1.0;
    pos.x *= -1.0;
    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * modelViewMatrix * pos;
    
    // 3D position of the color pixel.
    pos.x *= -1.0;
    vec4 color_position = u_depth_to_color * pos;
    vec2 color_index = color_project(color_position);
    v_color_texture_coord = color_index / vec2(640, 480);
}