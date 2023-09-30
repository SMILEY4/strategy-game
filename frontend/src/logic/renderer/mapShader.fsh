#version 300 es
#line 2
precision mediump float;

flat in vec4 v_tilePosition;
flat in vec2 v_terrain;
in vec2 v_textureCoordinates;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
    vec4 baseColor = texture(u_texture, v_textureCoordinates);
    vec3 finalColor = vec3(0.2);
    if(-0.1 < v_terrain.x && v_terrain.x < 0.1) {
        finalColor = baseColor.rgb * vec3(0.2);
    }
    if(0.9 < v_terrain.x && v_terrain.x < 1.1) {
        finalColor = baseColor.rgb * vec3(0.6);
    }
    if(1.9 < v_terrain.x && v_terrain.x < 2.1) {
        finalColor = baseColor.rgb;
    }
    outColor = vec4(finalColor, 1.0);
}
