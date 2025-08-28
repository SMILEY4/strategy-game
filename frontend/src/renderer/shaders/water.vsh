#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec2 in_worldPosition;
in uint in_borderMask;
in float in_depth;
in vec3 in_cornerData;
in uint in_directionData;

out vec2 v_textureCoordinates;
out float v_depth;
flat out uint v_borderMask;
out vec3 v_cornerData;
flat out uint v_directionData;

#include random

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_depth = in_depth;
    v_borderMask = in_borderMask;
    v_cornerData = in_cornerData;
    v_directionData = in_directionData;

    vec2 vertexPosition = offsetVertexPosition(in_vertexPosition, in_worldPosition, 20.0, 1.0);
    gl_Position = vec4((u_viewProjection * vec3(vertexPosition + in_worldPosition, 1.0)).xy, 0.0, 1.0);
}