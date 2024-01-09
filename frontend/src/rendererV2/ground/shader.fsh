#version 300 es
precision mediump float;


uniform sampler2D u_tileset;
in vec2 v_textureCoordinates;
in vec4 v_color;

out vec4 outColor;

void main() {
    float mask = texture(u_tileset, v_textureCoordinates).a;
    outColor = vec4(v_color.rgb, mask*v_color.a);
}
