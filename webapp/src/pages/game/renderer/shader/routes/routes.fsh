#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
in float v_pathLength;

out vec4 outColor;

void main() {
    vec2 uv = vec2(
            fract(v_textureCoordinates.x * (v_pathLength-1.0)),
            v_textureCoordinates.y
    );
    outColor = vec4(uv, 1.0, 1.0);
}
