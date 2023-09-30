#version 300 es
#line 2

uniform mat3 u_viewProjection;
in vec2 in_worldPosition;
in vec4 in_tilePosition;
in vec2 in_terrain;
in vec2 in_textureCoordinates;

flat out vec4 v_tilePosition;
flat out vec2 v_terrain;
out vec2 v_textureCoordinates;

void main() {
    v_tilePosition = in_tilePosition;
    v_terrain = in_terrain;
    v_textureCoordinates = in_textureCoordinates;

    vec3 pos = u_viewProjection * vec3(in_worldPosition, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
