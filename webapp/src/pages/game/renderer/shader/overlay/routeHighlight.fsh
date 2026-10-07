#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
in float v_pathLength;

uniform sampler2D u_texture;
uniform vec4 u_color;

out vec4 outColor;

void main() {

    vec2 uv = vec2(
            fract(v_textureCoordinates.x * (v_pathLength-1.0)),
            v_textureCoordinates.y
    );

    float texture = 1.0 - texture(u_texture, uv).r;

    outColor = vec4(u_color.rgb, texture * u_color.a);
}
