#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
in vec3 v_color;

uniform sampler2D u_spritesColor;
uniform sampler2D u_spritesOutline;

out vec4 outColor;


void main() {


    vec2 uv = vec2(
            v_textureCoordinates.x,
            1.0 - v_textureCoordinates.y
    );
    vec4 spriteColor = texture(u_spritesColor, uv);
    vec4 spriteOutline = texture(u_spritesOutline, uv);

    vec4 sprite = spriteColor;
    sprite = mix(sprite, spriteOutline, spriteOutline.a);

    if (sprite.a < 0.9) {
        discard;
    }

    outColor = vec4(sprite.rgb, 1.0);
}