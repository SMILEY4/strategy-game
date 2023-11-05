#version 300 es
#line 2

uniform mat3 u_viewProjection;
in vec2 in_worldPosition;
in vec2 in_textureCoordinates;
in int in_textureIndex;

out vec2 v_textureCoordinates;
flat out int v_textureIndex;

void main() {
    v_textureCoordinates = in_textureCoordinates;
    v_textureIndex = in_textureIndex;
    vec3 pos = u_viewProjection * vec3(in_worldPosition, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
