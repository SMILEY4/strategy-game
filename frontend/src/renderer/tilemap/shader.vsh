#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in ivec2 in_tilePosition;
in vec2 in_worldPosition;
in vec2 in_textureCoordinates;
in int in_tilesetIndex;
in int in_visibility;
in vec3 in_cornerData;
in int in_edgeDirection;
in int in_borderMask;
in vec3 in_borderColor;
in vec3 in_fillColor;


out vec2 v_textureCoordinates;
flat out ivec2 v_tilePosition;
out vec2 v_worldPosition;
flat out int v_tilesetIndex;
flat out int v_visibility;
out vec3 v_cornerData;
flat out int v_edgeDirection;
flat out int v_borderMask;
out vec3 v_borderColor;
out vec3 v_fillColor;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_tilePosition = in_tilePosition;
    v_worldPosition = in_vertexPosition + in_worldPosition;
    v_tilesetIndex = in_tilesetIndex;
    v_visibility = in_visibility;
    v_cornerData = in_cornerData;
    v_edgeDirection = in_edgeDirection;
    v_borderMask = in_borderMask;
    v_borderColor = in_borderColor;
    v_fillColor = in_fillColor;
    gl_Position = vec4((u_viewProjection * vec3(in_vertexPosition + in_worldPosition, 1.0)).xy, 0.0, 1.0);
}