#version 300 es
precision mediump float;

uniform sampler2D u_texture;
uniform sampler2D u_textureMask;

in vec2 v_textureCoordinates;

in vec3 v_baseTileColor;
in vec3 v_countryColor;

out vec4 outColor;

in float v_depth;


void main() {
    vec4 mask = texture(u_textureMask, v_textureCoordinates);
    vec4 base = texture(u_texture, v_textureCoordinates);
    if(base.a < 0.5 && mask.a < 0.5) {
        discard; // note: transparency does not work with depth testing
    }

    vec3 color = base.rgb;
    color = mix(color, v_baseTileColor, mask.g * mask.a);
    color = mix(color, v_countryColor, mask.r * mask.a);

    outColor = vec4(color, 1.0);
}
