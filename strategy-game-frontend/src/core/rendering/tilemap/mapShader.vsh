#version 300 es

uniform mat3 u_viewProjection;

in vec2 in_worldPosition;
in vec2 in_tilePosition;
in vec3 in_cornerData;
in vec3 in_terrainData;

in vec3 in_layer_values_country;
in vec3 in_layer_values_city;

in vec3 in_layer_borders_country;
in vec3 in_layer_borders_city;

flat out vec2 v_tilePosition;
out vec3 v_cornerData;
flat out vec3 v_terrainData;

flat out vec3 v_layer_values_country;
flat out vec3 v_layer_values_city;

flat out vec3 v_layer_borders_country;
flat out vec3 v_layer_borders_city;

void main() {

    v_tilePosition = in_tilePosition;
    v_cornerData = in_cornerData;
    v_terrainData = in_terrainData;

    v_layer_values_country = in_layer_values_country;
    v_layer_values_city = in_layer_values_city;

    v_layer_borders_country = in_layer_borders_country;
    v_layer_borders_city = in_layer_borders_city;

    vec3 pos = u_viewProjection * vec3(in_worldPosition, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
