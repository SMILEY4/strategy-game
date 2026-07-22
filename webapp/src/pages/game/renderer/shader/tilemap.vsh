#version 300 es

in vec3 in_vertexPosition;
in vec2 in_tilePosition;

uniform mat4 u_camera;

flat out vec2 v_tilePosition;

const float SQRT_3 = 1.732050;

void main() {
    v_tilePosition = in_tilePosition;

    float q = in_tilePosition.x;
    float r = in_tilePosition.y;

    float worldX = SQRT_3 * q + SQRT_3 / 2.0 * r;
    float worldZ = 3.0 / 2.0 * r;
    vec3 tileWorldCenter = vec3(worldX, 0.0, worldZ);

    vec3 finalWorldPos = tileWorldCenter + in_vertexPosition;

    gl_Position = u_camera * vec4(finalWorldPos, 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
}