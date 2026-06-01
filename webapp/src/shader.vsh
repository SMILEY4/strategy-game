#version 300 es

in vec3 in_vertexPosition;
in vec2 in_tilePosition;
in vec2 in_chunkPosition;

uniform mat4 u_camera;

flat out vec2 v_tilePosition;
flat out vec2 v_chunkPosition;

const float SQRT_3 = 1.732050;

void main() {
    v_tilePosition = in_tilePosition;
    v_chunkPosition = in_chunkPosition;

    float q = in_tilePosition.x;
    float r = in_tilePosition.y;

    float worldX = (SQRT_3 * q + SQRT_3 / 2.0 * r);
    float worldY = (0.0 * q + 3.0 / 2.0 * r);
    vec2 tileWorldCenter = vec2(worldX, worldY);

    vec2 finalWorldPos = tileWorldCenter + in_vertexPosition.xy;

    gl_Position = u_camera * vec4(finalWorldPos, in_vertexPosition.z, 1.0);
}