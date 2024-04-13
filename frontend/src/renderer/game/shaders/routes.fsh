#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
in vec2 v_lineCoordinates;

out vec4 outColor;

void main() {
    float value = step(0.0, sin(v_lineCoordinates.x));
    outColor = vec4(vec3(1.0), value);
}
