#version 300 es
precision mediump float;


uniform sampler2D u_tileset;
in vec2 v_textureCoordinates;
in vec4 v_color;
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

    float mask = texture(u_tileset, v_textureCoordinates).a;

    vec4 grayscale = vec4(vec3((v_color.r+v_color.g+v_color.b)/3.0), mask*v_color.a);
    vec4 baseColor = vec4(v_color.rgb, mask*v_color.a);
    vec4 color = mix(grayscale, baseColor, saturation) * vec4(vec3(brightness), 1.0);

    outColor = color;
}
