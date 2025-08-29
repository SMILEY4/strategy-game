#version 300 es
precision mediump float;

uniform sampler2D u_textureOutline;
uniform sampler2D u_textureColor;
uniform sampler2D u_textureMask;

in vec2 v_textureCoordinates;

in vec3 v_baseTileColor;
in vec3 v_countryColor;

out vec4 outColor;

in float v_depth;


void main() {

    vec4 colorOutline = texture(u_textureOutline, v_textureCoordinates);
    vec4 colorBase = texture(u_textureColor, v_textureCoordinates);
    vec4 colorMask = texture(u_textureMask, v_textureCoordinates);

    if(colorBase.a < 0.5 && colorOutline.a < 0.5) {
        discard; // note: transparency does not work with depth testing -> discard
    }

    vec3 color = colorBase.rgb;
    color = mix(color, v_baseTileColor, colorMask.g * colorMask.a);
    color = mix(color, v_countryColor, colorMask.r * colorMask.a);
    color = mix(color, colorOutline.rgb, colorOutline.a);

    outColor = vec4(color, 1.0);
}
