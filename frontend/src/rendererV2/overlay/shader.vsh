#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in vec3 in_cornerData;
in int in_directionData;
in vec2 in_worldPosition;
in ivec2 in_tilePosition;

out vec3 v_cornerData;
flat out int v_directionData;
flat out ivec2 v_tilePosition;
out vec2 v_worldPosition;

void main() {
    v_cornerData = in_cornerData;
    v_directionData = in_directionData;
    v_tilePosition = in_tilePosition;
    v_worldPosition = in_vertexPosition + in_worldPosition;
    gl_Position = vec4((u_viewProjection * vec3(in_vertexPosition + in_worldPosition, 1.0)).xy, 0.0, 1.0);
}