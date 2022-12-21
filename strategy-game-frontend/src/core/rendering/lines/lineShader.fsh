#version 300 es
#line 2
precision mediump float;

in vec3 v_texcoords;
out vec4 outColor;

void main() {
    outColor = mix(
        mix(vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), v_texcoords.y),
        mix(vec4(1.0, 1.0, 0.0, 1.0), vec4(0.0, 1.0, 1.0, 1.0), v_texcoords.y),
        v_texcoords.x
    );
}
