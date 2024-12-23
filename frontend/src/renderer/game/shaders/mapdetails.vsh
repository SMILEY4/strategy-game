#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_worldPosition;
in float in_originY;
in vec2 in_textureCoordinates;

out vec2 v_textureCoordinates;

void main() {
    v_textureCoordinates = in_textureCoordinates;

    // calculate screen coordinates of vertex
    vec2 screenPos = (u_viewProjection * vec3(in_worldPosition, 1.0)).xy;

    // calculate y screen coordinate of sprite "origin" [-1,+1]
    float screenPosOriginY = (u_viewProjection * vec3(in_worldPosition.x, in_originY / 2.0, 1.0)).y;

    // calculate sprite z based on (screen) "origin" y [minZ,maxZ]
    float minZ = 0.1;
    float maxZ = 0.9;
    float z = ((screenPosOriginY + 1.0) / 2.0) * (1.0 - minZ - (1.0-maxZ)) + minZ;

    // output sprite screen coordinates with calculated z/depth
    gl_Position = vec4(screenPos, z, 1.0);
}