#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in vec2 in_worldPosition;
in vec2 in_textureCoordinates;
in int in_tilesetIndex;
in int in_visibility;

out vec2 v_textureCoordinates;
out vec2 v_worldPosition;
flat out int v_tilesetIndex;
flat out int v_visibility;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_worldPosition = in_vertexPosition + in_worldPosition;
    v_tilesetIndex = in_tilesetIndex;
    v_visibility = in_visibility;
    gl_Position = vec4((u_viewProjection * vec3(in_vertexPosition + in_worldPosition, 1.0)).xy, 0.0, 1.0);
}