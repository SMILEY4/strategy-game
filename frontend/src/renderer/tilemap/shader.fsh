#version 300 es
precision mediump float;

/*
The texture for the tiles
*/
uniform sampler2D u_tileset;

/*
The paper texture
*/
uniform sampler2D u_texture;

/*
The additional noise texture
*/
uniform sampler2D u_noise;

/*
The current zoom value of the camera
*/
uniform float u_zoom;

/*
The position in world space - before transformation for camera
*/
in vec2 v_worldPosition;

/*
The texture coordinates [0-1]. Must be transformed to coordinates in u_tileset by using "v_tilesetIndex"
*/
in vec2 v_textureCoordinates;

/*
The position of the texture for the tile in "u_tileset"
*/
flat in int v_tilesetIndex;

/*
Visibility id
*/
flat in int v_visibility;

/*
Distance to each corner
1. distance to center
2. distance to corner "a",
3. distance to corner "b"
*/
in vec3 v_cornerData;

/*
The id of the direction of the current edge
e.g. 0 = bottom-right, 1 = top-right, 2 = top, ...
*/
flat in int v_edgeDirection;

/*
information whether there is a border in a given direction - packed into a single integer
first bit = direction "0", second bit = direction "1"
*/
flat in int v_borderMask;

/*
The final output color
*/
out vec4 outColor;


// ==================================//
//          UTILITY FUNCTIONS        //
// ==================================//

/*
convert the given rgb-color into hsv
*/
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

/*
convert the given hsv-color into rgb
*/
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

/*
check whether the bit at the given digit-position is set (i.e =1) for the given value.
Only digit-positions from 1 to 6 are allowed
*/
bool checkBit(int value, int digit) {
    int mask = 0;
    if (digit == 1) { mask = 1; }
    else if (digit == 2) { mask = 2; }
    else if (digit == 3) { mask = 4; }
    else if (digit == 4) { mask = 8; }
    else if (digit == 5) { mask = 16; }
    else if (digit == 6) { mask = 32; }
    return (value & mask) > 0;
}


// ==================================//
//            BASE TEXTURES          //
// ==================================//

float baseTextureClouds() {
    float scale = 200.0;
    return texture(u_noise, v_worldPosition / scale).x;
}

float baseTexturePaper() {
    float scale = 90.0;
    return texture(u_texture, v_worldPosition / scale).x;
}

float baseTexture(float basePaper, float baseClouds) {
    float impactPaper = 1.0;
    float impactClouds = 0.5;
    float paper = mix(1.0, basePaper, impactPaper);
    float clouds = mix(1.0, baseClouds, impactClouds);
    return paper * clouds;
}

// ==================================//
//            PAPER LAYER            //
// ==================================//

vec4 colorLayerPaper(float textureBase, float textureClouds) {
    // define tint color (in hsv)
    vec3 tintColor0 = rgb2hsv(vec3(0.88, 0.73, 0.62));
    vec3 tintColor1 = rgb2hsv(vec3(0.99, 0.75, 0.58));
    vec3 tintColor = mix(tintColor0, tintColor1, 1.0-textureClouds);
    // merge texture with tint
    vec3 colorHSV = vec3(tintColor.x, tintColor.y, textureBase);
    // convert back to rgb(a)
    return vec4(hsv2rgb(colorHSV), 1.0);
}


// ==================================//
//            TERRAIN LAYER          //
// ==================================//

vec2 tilesetTextureCoords(vec2 textureCoordinates, int index) {
    float totalTiles = 4.0;
    float slotSize = 600.0;
    float gapSize = 10.0;
    // calculate total with of tileset-strip
    float totalWidth = gapSize + (slotSize + gapSize) * totalTiles;
    // x position in px of left edge of tileset-slot
    float texCoordPx = textureCoordinates.x * slotSize;
    float offsetPx = gapSize + (float(index) * (slotSize + gapSize));
    // x position of transformed texture coordinate in px
    float uPx = texCoordPx + offsetPx;
    // texture coordinates in uv-space (i.e. 0-1)
    float u = uPx / totalWidth;
    float v = textureCoordinates.y;
    return vec2(u, v);
}

vec4 baseColorTerrain() {
    vec2 texCoords = tilesetTextureCoords(v_textureCoordinates, v_tilesetIndex);
    return texture(u_tileset, texCoords);
}

vec4 colorLayerTerrain(float textureBase) {
    vec4 baseColor = baseColorTerrain();
    return vec4(baseColor.rgb * textureBase, baseColor.a);
}

// ==================================//
//            OVERLAY LAYER          //
// ==================================//

vec3 borderMaskDirection(int mask, int edgeDirection) {
    // get direction indices
    int dirPrev = (edgeDirection-1) < 0 ? 5 : edgeDirection-1;
    int dirCurr = edgeDirection;
    int dirNext = int(mod(float(edgeDirection+1), 6.0));
    // check if bit in mask is set
    bool isPrev = checkBit(mask, dirPrev+1);
    bool isCurr = checkBit(mask, dirCurr+1);
    bool isNext = checkBit(mask, dirNext+1);
    // as float values - either 0 or 1
    return vec3((isPrev ? 1.0 : 0.0), (isCurr ? 1.0 : 0.0), (isNext ? 1.0 : 0.0));
}

vec3 borderMaskEdge(vec3 cornerData, float thickness) {
    float maskCurr = 1.0 - step(thickness, cornerData.x);
    float maskPrev = step(1.0 - thickness, cornerData.y);
    float maskNext = step(1.0 - thickness, cornerData.z);
    return vec3(maskPrev, maskCurr, maskNext);
}

float borderMaskCombine(vec3 directionMask, vec3 edgeMask) {
    vec3 borderValues = directionMask * edgeMask;
    return min(1.0, borderValues.x + borderValues.y + borderValues.z);
}

vec4 borderPrimary() {
    float thickness = 0.2;
    vec3 color = vec3(1.0, 0.0, 0.0);
    // masks
    vec3 maskDirection = borderMaskDirection(v_borderMask, v_edgeDirection);
    vec3 maskEdge = borderMaskEdge(v_cornerData, thickness);
    float maskCombined = borderMaskCombine(maskDirection, maskEdge);
    // color
    return mix(vec4(0.0), vec4(color, 1.0), maskCombined);
}

vec4 borderTile(float zoom) {
    float zoomThreshold = 3.5;
    float zoomMax = 10.0;
    float minThickness = 0.015;
    float maxThickness = 0.025;
    if (zoom < zoomThreshold) {
        return vec4(0.0);
    } else {
        float zoomPerc = smoothstep(zoomThreshold, zoomMax, zoom);
        float thickness = zoomPerc * (maxThickness - minThickness) + minThickness;
        float value = step(v_cornerData.x, thickness);
        return vec4(vec3(0.0), value * 0.6);
    }
}

vec4 colorLayerOverlay() {
    // get borders
    vec4 tile = borderTile(u_zoom);
    vec4 primary = borderPrimary();
    // combine
    vec4 color = vec4(0.0);
    color = mix(color, primary, primary.a);
    color = mix(color, tile, tile.a);
    return color;
}

// ==================================//
//                MISC               //
// ==================================//

vec4 applyFogOfWar(vec4 color) {
    if (v_visibility == 0) { // unknown
        return vec4(color.rgb * 0.2, color.a);
    }
    if (v_visibility == 1) { // discovered
        return vec4(color.rgb * 0.5, color.a);
    }
    if (v_visibility == 2) { // visible
        return color;
    }
    return color;
}

// ==================================//
//                MAIN               //
// ==================================//

void main() {

    // textures
    float texturePaper = baseTexturePaper();
    float textureClouds = baseTextureClouds();
    float textureBase = baseTexture(texturePaper, textureClouds);

    // layers
    vec4 layerPaper  = colorLayerPaper(textureBase, textureClouds);
    vec4 layerTerrain = colorLayerTerrain(textureBase);
    vec4 layerOverlay = colorLayerOverlay();

    // combine layers
    vec4 color = layerPaper;
    color = mix(color, layerTerrain, layerTerrain.a);
    color = mix(color, layerOverlay, layerOverlay.a);

    // apply effects
    color = applyFogOfWar(color);

    // result
    outColor = vec4(color.rgb, 1.0);
}
