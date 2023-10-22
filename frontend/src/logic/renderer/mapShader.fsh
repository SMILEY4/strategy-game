#version 300 es
#line 2
precision mediump float;

flat in vec4 v_tilePosition;
flat in ivec2 v_terrain;
in vec2 v_textureCoordinates;
in vec3 v_cornerData;
flat in vec3 v_borders;


uniform sampler2D u_texture;
uniform ivec2 u_selectedTile;
uniform ivec2 u_hoverTile;

out vec4 outColor;

vec4 mapColor() {
    vec4 baseColor = texture(u_texture, v_textureCoordinates);
    int visibility = v_terrain.x;
    if (visibility == 0) { // unknown
        return vec4(baseColor.rgb * 0.2, 1.0);
    }
    if (visibility == 1) { // discovered
        return vec4(baseColor.rgb * 0.5, 1.0);
    }
    if (visibility == 2) { // visible
        return vec4(baseColor.rgb, 1.0);
    }
    return vec4(1.0);
}

vec4 generalBorderColor() {
    float border0 = step(0.98, 1.0 - v_cornerData.x);
    float border1 = step(0.95, 1.0 - v_cornerData.x);
    float border2 = step(0.90, 1.0 - v_cornerData.x);
    if (int(v_tilePosition.x) == u_selectedTile.x && int(v_tilePosition.y) == u_selectedTile.y) {
        return vec4(vec3(1.0, 0.0, 0.0), border2);
    } else if (int(v_tilePosition.x) == u_hoverTile.x && int(v_tilePosition.y) == u_hoverTile.y) {
        return vec4(vec3(0.0, 1.0, 0.0), border1);
    } else {
        return vec4(vec3(0.0), border0);
    }
}

vec3 unpackRGB(float packedColor) {
    float b = floor(packedColor / 256.0 / 256.0);
    float g = floor((packedColor - b * 256.0 * 256.0) / 256.0);
    float r = floor(mod(packedColor, 256.0));
    return vec3(r, g, b) / 256.0;
}

vec4 tileBorderColor() {
    float border0 = step(0.89, 1.0 - v_cornerData.x);
    float border1 = step(0.93, 1.0 - v_cornerData.x);
    float border2 = step(0.96, 1.0 - v_cornerData.x);

    float packed0 = v_borders.x * border0;
    float packed1 = v_borders.y * border1;
    float packed2 = v_borders.z * border2;

    vec3 color0 = unpackRGB(packed0);
    vec3 color1 = unpackRGB(packed1);
    vec3 color2 = unpackRGB(packed2);

    if (packed2 > 0.1) {
        return vec4(color2, border2);
    } else if(packed1 > 0.1){
        return vec4(color1, border1);
    } else if(packed0 > 0.1){
        return vec4(color0, border0);
    } else {
        return vec4(0.0);
    }

}

void main() {
    vec4 map = mapColor();
    vec4 generalBorder = generalBorderColor();
    vec4 tileBorder = tileBorderColor();
    vec4 border = mix(generalBorder, tileBorder, tileBorder.a);
    outColor = mix(map, border, border.a);
}
