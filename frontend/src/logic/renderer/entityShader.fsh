#version 300 es
#line 2
precision mediump float;

uniform sampler2D u_textureIcons;
uniform sampler2D u_textureLabels;

in vec2 v_textureCoordinates;
flat in int v_textureIndex;

out vec4 outColor;


void main() {
    if (v_textureIndex == 0) {
        outColor = texture(u_textureIcons, v_textureCoordinates);
    } else {
        outColor = texture(u_textureLabels, v_textureCoordinates);
    }
}
