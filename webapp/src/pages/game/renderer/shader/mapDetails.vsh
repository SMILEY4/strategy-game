#version 300 es

in vec2 in_tilePosition;
in vec3 in_vertexPosition;
in vec2 in_offset;
in vec2 in_textureCoordinates;
in vec3 in_color;

uniform mat4 u_camera;
uniform vec3 u_cameraDirection;

out vec2 v_textureCoordinates;
out vec3 v_color;

const float SQRT_3 = 1.732050;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_color = in_color;

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
    vertexWorldPos += vec3(in_offset.x, 0.0, in_offset.y);

    // todo: really hacky...
    float tiltFactor = -u_cameraDirection.x;
    float tilt = smoothstep(-5.0, -0.0, tiltFactor);
    vertexWorldPos += vec3(-tilt * vertexWorldPos.y, 0.0, 0.0);

    // project to screen coordinates
    gl_Position = u_camera * vec4(vertexWorldPos, 1.0) * vec4(1.0, -1.0, 1.0, 1.0);
}