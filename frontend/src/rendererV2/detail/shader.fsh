#version 300 es
precision mediump float;

uniform sampler2D u_tileset;

in vec2 v_textureCoordinates;
flat in int v_visibility;

out vec4 outColor;

void main() {

    float saturation = 1.0;
    if(v_visibility == 0) saturation = 0.0;
    if(v_visibility == 1) saturation = 0.5;
    if(v_visibility == 2) saturation = 1.0;

    float brightness = 1.0;
    if(v_visibility == 0) brightness = 1.0;
    if(v_visibility == 1) brightness = 0.6;
    if(v_visibility == 2) brightness = 1.0;

    vec4 color = texture(u_tileset, v_textureCoordinates);
    vec4 grayscale = vec4(vec3((color.r+color.g+color.b)/3.0), color.a);

    outColor = mix(grayscale, color, saturation) * vec4(vec3(brightness), 1.0);
}
