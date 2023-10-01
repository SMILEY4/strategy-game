#version 300 es
#line 2
precision mediump float;

flat in vec4 v_tilePosition;
flat in ivec2 v_terrain;
in vec2 v_textureCoordinates;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
    vec4 baseColor = texture(u_texture, v_textureCoordinates);
    int visibility = v_terrain.x;
    if (visibility == 0) { // unknown
        outColor = vec4(baseColor.rgb * 0.2, 1.0);
    }
    if (visibility == 1) { // discovered
        outColor = vec4(baseColor.rgb * 0.5, 1.0);
    }
    if (visibility == 2) { // visible
        outColor = vec4(baseColor.rgb, 1.0);
    }
}
