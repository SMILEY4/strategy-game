#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_rendertarget;

out vec4 outColor;

void main() {
    vec4 color = texture(u_rendertarget, v_textureCoordinates);
    outColor = color;
}