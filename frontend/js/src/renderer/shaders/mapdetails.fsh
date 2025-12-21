#version 300 es
precision mediump float;

uniform sampler2D u_textureOutline;
uniform sampler2D u_textureColor;
uniform sampler2D u_textureMask;

in vec2 v_textureCoordinates;

in vec3 v_baseTileColor;
in vec3 v_countryColor;
flat in uint v_commandState;


out vec4 outColor;

in float v_depth;


void main() {

    vec4 colorOutline = texture(u_textureOutline, v_textureCoordinates);
    vec4 colorBase = texture(u_textureColor, v_textureCoordinates);
    vec4 colorMask = texture(u_textureMask, v_textureCoordinates);

    if (colorBase.a < 0.5 && colorOutline.a < 0.5) {
        discard;// note: transparency does not work with depth testing -> discard
    }

    float grayscaleBaseColor = (colorBase.r + colorBase.g + colorBase.b) / 3.0;
    float grayscaleTileColor = (v_baseTileColor.r + v_baseTileColor.g + v_baseTileColor.b) / 3.0;
    float grayscaleOutlineColor = (colorOutline.r + colorOutline.g + colorOutline.b) / 3.0;

    vec3 colorCommandDestroy = vec3(1.0, 0.8823, 0.85098);
    vec3 colorCommandCreate = vec3(0.8196, 0.9450, 0.9921);

    if (v_commandState == 1u) {
        // command state = destroy
        vec3 color = vec3(grayscaleBaseColor) * colorCommandDestroy;
        color = mix(color, vec3(grayscaleTileColor) * colorCommandDestroy, colorMask.g * colorMask.a);
        color = mix(color, v_countryColor, colorMask.r * colorMask.a);
        color = mix(color, vec3(grayscaleOutlineColor) * colorCommandDestroy, colorOutline.a);
        color = mix(color, vec3(1.0), 0.3);
        outColor = vec4(color, 1.0);

    } else if (v_commandState == 2u) {
        // command state = create
        vec3 color = vec3(grayscaleBaseColor) * colorCommandCreate;
        color = mix(color, vec3(grayscaleTileColor) * colorCommandCreate, colorMask.g * colorMask.a);
        color = mix(color, v_countryColor, colorMask.r * colorMask.a);
        color = mix(color, vec3(grayscaleOutlineColor) * colorCommandCreate, colorOutline.a);
        color = mix(color, vec3(1.0), 0.3);
        outColor = vec4(color, 1.0);

    } else {
        // command state = none
        vec3 color = colorBase.rgb;
        color = mix(color, v_baseTileColor, colorMask.g * colorMask.a);
        color = mix(color, v_countryColor, colorMask.r * colorMask.a);
        color = mix(color, colorOutline.rgb, colorOutline.a);
        outColor = vec4(color, 1.0);
    }

}
