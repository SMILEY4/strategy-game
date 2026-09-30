#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
in vec3 v_vertexWorldPos;
in float v_highlightHeight;
flat in ivec2 v_tilePosition;
flat in int v_type;

uniform sampler2D u_paintCircle;
uniform int u_side;
uniform ivec2 u_pointerPosition;
uniform vec4 u_selectedColor;
uniform vec4 u_availableColor;
uniform vec4 u_availableHoverColor;
uniform float u_sideOpacity;

out vec4 outColor;

void main() {


    vec4 texture = texture(u_paintCircle, v_textureCoordinates);

    float alphaSide = 1.0;
    if(u_side == 2) {
        alphaSide = u_sideOpacity;
    }
    if(v_vertexWorldPos.y > 0.11 && u_side == 2) {
        alphaSide = 0.0;
    }

    float alphaHeight = 1.0 - smoothstep(0.1, 0.1 + v_highlightHeight, v_vertexWorldPos.y);

    float alphaPart = 1.0;
    if(v_vertexWorldPos.y > 0.11) {
        alphaPart = 0.4;
    }


    vec4 color = u_selectedColor;
    if(v_type == 1) {
        color = u_selectedColor;
    }
    if(v_type == 2) {
        if(u_pointerPosition.x == v_tilePosition.x && u_pointerPosition.y == v_tilePosition.y) {
            color = u_availableHoverColor;
        } else {
            color = u_availableColor;
        }
    }


    outColor = vec4(color.rgb, color.a * (1.0 - texture.r) * alphaSide * alphaHeight * alphaPart);

}
