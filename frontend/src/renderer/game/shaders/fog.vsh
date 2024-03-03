#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec2 in_worldPosition;
in int in_visibility;

out vec2 v_textureCoordinates;
flat out int v_visibility;

void main() {
    v_visibility = in_visibility;
    v_textureCoordinates = in_textureCoordinates;
    gl_Position = vec4((u_viewProjection * vec3(in_vertexPosition + in_worldPosition, 1.0)).xy, 0.0, 1.0);
}