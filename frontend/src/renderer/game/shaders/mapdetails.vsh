#version 300 es

uniform mat3 u_viewProjection;

in vec3 in_worldPosition;
in vec2 in_textureCoordinates;

out vec2 v_textureCoordinates;


void main() {
    v_textureCoordinates = in_textureCoordinates;

    // calculate 2d screen coordinates of vertex (screen x,y)
    vec2 screenPos = (u_viewProjection * vec3(in_worldPosition.xy, 1.0)).xy;

    float screenZ = (u_viewProjection * vec3(0.0, in_worldPosition.z, 1.0)).y;
    screenZ = (clamp(screenZ, -0.99, 0.99) + 1.0) * 0.5;

    // output sprite screen coordinates with calculated z/depth
    gl_Position = vec4(screenPos, screenZ, 1.0);
}