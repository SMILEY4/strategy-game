#version 300 es

uniform mat3 u_viewProjection;

in vec3 in_worldPosition;
in vec2 in_textureCoordinates;
in vec3 in_baseTileColor;
in vec3 in_countryColor;
in uint in_commandState;


out vec2 v_textureCoordinates;
out vec3 v_baseTileColor;
out vec3 v_countryColor;
flat out uint v_commandState;


void main() {
    v_textureCoordinates = in_textureCoordinates;

    // calculate 2d screen coordinates of vertex (screen x,y)
    vec2 screenPos = (u_viewProjection * vec3(in_worldPosition.xy, 1.0)).xy;

    // map z values (based on world y) to screen z values (based on screen y)
    float screenZ = (u_viewProjection * vec3(0.0, in_worldPosition.z, 1.0)).y;

    // map values in range [range0, range1] to values [0,1]
    float range0 = -2.0;
    float range1 = +2.0;
    screenZ = (screenZ - range0) / (range1 - range0);

    v_baseTileColor = in_baseTileColor;
    v_countryColor = in_countryColor;
    v_commandState = in_commandState;

    // output sprite screen coordinates with calculated z/depth
    gl_Position = vec4(screenPos, screenZ, 1.0);
}