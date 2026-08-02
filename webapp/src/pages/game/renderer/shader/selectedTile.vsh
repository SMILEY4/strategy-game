#version 300 es

in vec3 in_vertexPosition;
in vec2 in_textureCoordinates;
in vec2 in_tilePosition;

uniform mat4 u_camera;

out vec2 v_textureCoordinates;

const float SQRT_3 = 1.732050;

void main() {
    v_textureCoordinates = in_textureCoordinates;

    // tile coordinates
    float q = in_tilePosition.x;
    float r = in_tilePosition.y;

    // transform tile coordinates to world coordinates
    float worldX = SQRT_3 * q + SQRT_3 / 2.0 * r;
    float worldZ = 3.0 / 2.0 * r;
    vec3 tileWorldCenter = vec3(worldX, 0.0, worldZ);

    // calculate world coordinate of each vertex
    float scale = 1.0; // todo: debug variable
    vec3 vertexWorldPos = tileWorldCenter + (in_vertexPosition * vec3(scale, 1.0, scale));

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
}