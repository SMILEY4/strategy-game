#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_paintCircle;
uniform int u_side;

out vec4 outColor;

void main() {

    vec4 texture = texture(u_paintCircle, v_textureCoordinates);

    float alphaSide = 1.0;
    if(u_side == 2) {
        alphaSide = 0.4;
    }

    outColor = vec4(vec3(1.0), (1.0 - texture.r) * alphaSide);

}