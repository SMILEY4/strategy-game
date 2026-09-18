#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
in vec3 v_vertexWorldPos;

uniform sampler2D u_paintCircle;
uniform int u_side;

out vec4 outColor;

void main() {

    vec4 texture = texture(u_paintCircle, v_textureCoordinates);

    float alphaSide = 1.0;
    if(u_side == 2) {
        alphaSide = 0.4;
    }
    if(v_vertexWorldPos.y > 0.11 && u_side == 2) {
        alphaSide = 0.0;
    }

    float alphaHeight = 1.0 - smoothstep(0.1, 4.1, v_vertexWorldPos.y);

    float alphaPart = 1.0;
    if(v_vertexWorldPos.y > 0.11) {
        alphaPart = 0.4;
    }

    outColor = vec4(vec3(1.0), (1.0 - texture.r) * alphaSide * alphaHeight * alphaPart);

}
