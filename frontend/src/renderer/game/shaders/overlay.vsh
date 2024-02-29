#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec3 in_cornerData;
in int in_directionData;
in vec2 in_worldPosition;
in int in_borderMask;
in vec4 in_borderColor;
in vec4 in_fillColor;

out vec2 v_textureCoordinates;
out vec3 v_cornerData;
flat out int v_directionData;
flat out int v_borderMask;
out vec4 v_borderColor;
out vec4 v_fillColor;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_cornerData = in_cornerData;
    v_directionData = in_directionData;
    v_borderMask = in_borderMask;
    v_borderColor = in_borderColor;
    v_fillColor = in_fillColor;
    gl_Position = vec4((u_viewProjection * vec3(in_vertexPosition + in_worldPosition, 1.0)).xy, 0.0, 1.0);
}