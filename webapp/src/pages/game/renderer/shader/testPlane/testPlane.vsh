#version 300 es

in vec2 in_vertexPosition; // this is a quad with x and y ranging from -1 to +1

uniform mat4 u_camera;
uniform vec3 u_cameraPosition;
uniform float u_cameraFarDistance;

void main() {

    // 1. Convert 2D input quad [-1, +1] to XZ ground coordinates
    // Scale by u_cameraFarDistance to cover the visible view radius
    vec3 worldPos;
    worldPos.x = in_vertexPosition.x * u_cameraFarDistance;
    worldPos.y = 0.1;
    worldPos.z = in_vertexPosition.y * u_cameraFarDistance;

    // 2. Offset plane to keep centered at camera's X and Z world position
    worldPos.x += u_cameraPosition.x;
    worldPos.z += u_cameraPosition.z;

    // 4. Transform to clip space using your View-Projection matrix
    gl_Position = u_camera * vec4(worldPos, 1.0);
}