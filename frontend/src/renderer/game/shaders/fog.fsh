#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_textureCoordinates;
flat in int v_visibility;

out vec4 outColor;


void main() {
    vec4 texture = texture(u_texture, v_textureCoordinates);
    if(v_visibility == 1) {
        outColor = vec4(0.0, 1.0, 0.0, texture.a);
    } else {
        outColor = vec4(1.0, 0.0, 0.0, texture.a);
    }
}
