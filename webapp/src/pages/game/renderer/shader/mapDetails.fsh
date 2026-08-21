#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;
flat in uint v_atlasId;
flat in uint v_isPending;

uniform sampler2D u_atlasMountainsColor;
uniform sampler2D u_atlasMountainsOutline;
uniform sampler2D u_atlasMountainsMask;

uniform sampler2D u_atlasHillsColor;
uniform sampler2D u_atlasHillsOutline;
uniform sampler2D u_atlasHillsMask;

uniform sampler2D u_atlasTreesColor;
uniform sampler2D u_atlasTreesOutline;
uniform sampler2D u_atlasTreesMask;

uniform sampler2D u_atlasBuildingsColor;
uniform sampler2D u_atlasBuildingsOutline;
uniform sampler2D u_atlasBuildingsMask;

out vec4 outColor;

void main() {

    vec2 uv = vec2(
            v_textureCoordinates.x,
            1.0 - v_textureCoordinates.y
    );

    vec4 spriteRawColor = vec4(0.0);
    vec4 spriteOutline = vec4(0.0);
    vec4 spriteMask = vec4(0.0);

    if(v_atlasId == 1u) {
        spriteRawColor = texture(u_atlasMountainsColor, uv);
        spriteOutline = texture(u_atlasMountainsOutline, uv);
        spriteMask = texture(u_atlasMountainsMask, uv);
    }
    if(v_atlasId == 2u) {
        spriteRawColor = texture(u_atlasHillsColor, uv);
        spriteOutline = texture(u_atlasHillsOutline, uv);
        spriteMask = texture(u_atlasHillsMask, uv);
    }
    if(v_atlasId == 3u) {
        spriteRawColor = texture(u_atlasTreesColor, uv);
        spriteOutline = texture(u_atlasTreesOutline, uv);
        spriteMask = texture(u_atlasTreesMask, uv);
    }
    if(v_atlasId == 4u) {
        spriteRawColor = texture(u_atlasBuildingsColor, uv);
        spriteOutline = texture(u_atlasBuildingsOutline, uv);
        spriteMask = texture(u_atlasBuildingsMask, uv);
    }

    if(v_isPending == 1u) {
        spriteRawColor = vec4(vec3(1.0), spriteRawColor.a);
    }

    vec3 terrainColor = vec3(112.0/255.0, 112.0/255.0, 86.0/255.0);

    vec4 spriteColor = spriteRawColor;
    spriteColor = mix(spriteRawColor, vec4(terrainColor, 1.0) * spriteRawColor , spriteMask.r);

    vec4 sprite = spriteColor;
    sprite = mix(sprite, spriteOutline, spriteOutline.a);

    if (sprite.a < 0.5) {
        discard;
    }

    outColor = vec4(sprite.rgb, 1.0);
}