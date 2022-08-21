#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_worldPosition;
in vec2 in_tilePosition;
in float in_terrainData;
in vec4 in_overlayColor;
in vec3 in_cornerData;
in vec3 in_borderData;

flat out vec2 v_tilePosition;
flat out float v_terrainData;
flat out vec4 v_overlayColor;
out vec3 v_cornerData;
flat out vec3 v_borderData;


void main() {

    v_tilePosition = in_tilePosition;
    v_terrainData = in_terrainData;
    v_overlayColor = in_overlayColor;
    v_cornerData = in_cornerData;
    v_borderData = in_borderData;

    vec3 pos = u_viewProjection * vec3(in_worldPosition, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
