#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in vec2 in_worldPosition;
in vec3 in_cornerData;
in int in_edgeDirection;
in int in_borderMask;
in int in_visibility;

out vec3 v_cornerData;
out vec2 v_worldPosition;
flat out int v_edgeDirection;
flat out int v_borderMask;
flat out int v_visibility;

void main() {
    v_cornerData = in_cornerData;
    v_edgeDirection = in_edgeDirection;
    v_borderMask = in_borderMask;
    v_worldPosition = in_worldPosition + in_vertexPosition;
    v_visibility = in_visibility;
    gl_Position = vec4((u_viewProjection * vec3(in_vertexPosition + in_worldPosition, 1.0)).xy, 0.0, 1.0);
}