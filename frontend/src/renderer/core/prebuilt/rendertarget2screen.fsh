#version 300 es
precision mediump float;

uniform sampler2D u_renderTarget;
in vec2 v_textureCoordinates;
out vec4 outColor;

void main() {
    outColor = vec4(texture(u_renderTarget, v_textureCoordinates));
}