#version 300 es

uniform mat3 u_viewProjection;
in vec2 in_position;
in vec3 in_textureCoords;
in vec4 in_color;
out vec3 v_textureCoords;
out vec4 v_color;

void main() {
    v_textureCoords = in_textureCoords;
    v_color = in_color;
    vec3 pos = u_viewProjection * vec3(in_position, 1.0);
    gl_Position = vec4(pos.xy, 0.0, 1.0);
}
