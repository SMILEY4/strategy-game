#version 300 es
#line 2
precision mediump float;

// the position of the tile in the tilemap (q,r,chunkQ,chunkR)
flat in vec4 v_tilePosition;

// visibility and terrain-id
flat in ivec2 v_terrain;

// texture coordinates in the tileset
in vec2 v_textureCoordinates;

// distances to the corners of the current triangle (to center, to corner0, to corner1)
in vec3 v_cornerData;

// packed rgb-colors of the 3 possible borders
flat in vec3 v_borderColors;

// packed data of the 3 possible borders (whether there is or isnt a border on this edge, the previous and the next one)
flat in ivec3 v_borderData;

uniform sampler2D u_texture;
uniform ivec2 u_selectedTile;
uniform ivec2 u_hoverTile;

out vec4 outColor;

/*
returns the color of the tile, with fog-of-war applied
*/
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

/*
Calculates the areas of the border in one triangle and returns 1 if the fragment is inside the border-area and 0 otherwise
x=1: fragment is in the the whole border-area/edge
y=1: fragment is in the border-area of the first corner
z=1: fragment is in the border-area of the second corner
*/
vec3 calculateBorderArea(vec3 cornedData, float thickness) {
    float borderCenter = step(1.0-thickness, 1.0-cornedData.x);
    float borderCorner0 = step(1.0-thickness, cornedData.y);
    float borderCorner1 = step(1.0-thickness, cornedData.z);
    return vec3(borderCenter, borderCorner0, borderCorner1);
}

/*
checks whether this fragment is in any border-area
*/
bool isBorder(vec3 cornerData, float thickness, int borderData) {
    vec3 borderArea = calculateBorderArea(cornerData, thickness);
    if ((borderData & 1) == 0) {
        borderArea = borderArea * vec3(0.0, 1.0, 1.0);
    }
    if ((borderData & 2) == 0) {
        borderArea = borderArea * vec3(1.0, 0.0, 1.0);
    }
    if ((borderData & 4) == 0) {
        borderArea = borderArea * vec3(1.0, 1.0, 0.0);
    }
    float border = step(0.8, borderArea.x + borderArea.y + borderArea.z);
    return border > 0.8;
}

vec3 unpackRGB(float packedColor) {
    float b = floor(packedColor / 256.0 / 256.0);
    float g = floor((packedColor - b * 256.0 * 256.0) / 256.0);
    float r = floor(mod(packedColor, 256.0));
    return vec3(r, g, b) / 256.0;
}

/*
get the color of the border with the given data, or a zero-vector
*/
vec4 getBorder(vec3 cornerData, float thickness, float packedColor, int packedBorderData) {
    if (isBorder(cornerData, thickness, packedBorderData)) {
        return vec4(unpackRGB(packedColor), 1.0);
    } else {
        return vec4(0.0);
    }
}

void main() {

    // base map color
    vec3 color = mapColor().rgb;

    // add borders
    vec4 border0 = getBorder(v_cornerData, 0.2, v_borderColors.x, v_borderData.x);
    vec4 border1 = getBorder(v_cornerData, 0.125, v_borderColors.y, v_borderData.y);
    vec4 border2 = getBorder(v_cornerData, 0.075, v_borderColors.z, v_borderData.z);
    color = mix(color, border0.rgb, border0.a);
    color = mix(color, border1.rgb, border1.a);
    color = mix(color, border2.rgb, border2.a);

    // add mouseover and selected
    if(u_selectedTile.x == int(v_tilePosition.x) && u_selectedTile.y == int(v_tilePosition.y)) {
        color = mix(color, vec3(0, 0.784, 1.0), step(0.90, 1.0-v_cornerData.x));
    }
    if(u_hoverTile.x == int(v_tilePosition.x) && u_hoverTile.y == int(v_tilePosition.y)) {
        color = mix(color, vec3(0, 0.784, 1.0), step(0.94, 1.0-v_cornerData.x));
    }

    // add tile-borders
    color = color *  step(0.02, v_cornerData.x);

    outColor = vec4(color, 1.0);
}














