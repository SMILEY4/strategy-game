#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_worldPosition;
in vec2 in_textureCoordinates;

out vec2 v_textureCoordinates;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    gl_Position = vec4((u_viewProjection * vec3(in_worldPosition, 1.0)).xy, 0.0, 1.0);
}