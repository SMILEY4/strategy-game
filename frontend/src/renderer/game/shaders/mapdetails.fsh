#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_textureCoordinates;

out vec4 outColor;

void main() {
    vec4 color = texture(u_texture, v_textureCoordinates);
    if(color.a < 0.5) {
        discard; // note: transparency does not work with depth testing
    }
    outColor = vec4(color.rgb, 1.0);
}
