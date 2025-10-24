#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec3 in_cornerData;
in uint in_directionData;
in vec2 in_worldPosition;
in ivec2 in_tilePosition;

in uint in_borderMask;
in vec4 in_borderColor;
in vec4 in_fillColor;

in uint in_highlight;

out vec2 v_textureCoordinates;
flat out ivec2 v_tilePosition;
out vec2 v_worldCoordinates;
out vec3 v_cornerData;
flat out uint v_directionData;

flat out uint v_borderMask;
out vec4 v_borderColor;
out vec4 v_fillColor;

flat out uint v_highlight;

#include random

void main() {

    v_textureCoordinates = in_textureCoordinates;
    v_cornerData = in_cornerData;
    v_directionData = in_directionData;
    v_borderMask = in_borderMask;
    v_borderColor = in_borderColor;
    v_fillColor = in_fillColor;
    v_highlight = in_highlight;
    v_tilePosition = in_tilePosition;

    vec2 vertexPosition = in_vertexPosition;
    bool isCenter = in_cornerData.x > 0.9 && in_cornerData.y < 0.1 && in_cornerData.z < 0.1;
    if(!isCenter) {
        vertexPosition = offsetVertexPosition(in_vertexPosition, in_worldPosition, 0.0, 1.0);
    }

    v_worldCoordinates = vertexPosition + in_worldPosition;
    gl_Position = vec4((u_viewProjection * vec3(v_worldCoordinates, 1.0)).xy, 0.0, 1.0);
}