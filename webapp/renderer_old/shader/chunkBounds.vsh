#version 300 es

in vec3 in_vertexPosition;
in vec3 in_worldPosition;
in float in_radius;

uniform mat4 u_camera;

void main() {

    vec3 finalWorldPos = in_worldPosition + (in_vertexPosition * in_radius);

    gl_Position = u_camera * vec4(finalWorldPos, 1.0);
}