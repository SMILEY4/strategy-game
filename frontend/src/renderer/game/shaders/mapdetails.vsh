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
    float screenPosOriginY = (u_viewProjection * vec3(in_worldPosition.x, in_originY, 1.0)).y;
    float z = (clamp(screenPosOriginY, -0.99, 0.99) + 1.0) * 0.5;

    // output sprite screen coordinates with calculated z/depth
    gl_Position = vec4(screenPos, z, 1.0);
}