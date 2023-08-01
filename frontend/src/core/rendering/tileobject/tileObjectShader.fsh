#version 300 es
#line 2
precision mediump float;

uniform sampler2D u_texture_sprites;
uniform sampler2D u_texture_labels;

in vec3 v_textureCoords;
in vec4 v_color;
out vec4 outColor;

void main() {
    if(v_textureCoords.x < 0.5) {
        outColor = texture(u_texture_sprites, v_textureCoords.yz) * v_color;
    } else {
        outColor = texture(u_texture_labels, v_textureCoords.yz) * v_color;
    }
}
