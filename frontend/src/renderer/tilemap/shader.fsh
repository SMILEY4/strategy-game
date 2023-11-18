#version 300 es
precision mediump float;


struct BaseTextureData {
    float scalePaper;
    float scaleClouds;

    float strengthPaper;
    float strengthClouds;

    vec3 colorLight;
    vec3 colorDark;

};

uniform BaseTextureData u_baseTextureData;


struct TerrainTilesetData {
    float totalTileCount;
    float slotSize;
    float gapSize;
};

uniform TerrainTilesetData u_terrainTilesetData;


struct OceanWaveData {
    float thickness;
    float waveScale;
    float waveTimeScale;
    float waveStrength;
};

uniform OceanWaveData u_oceanWaveData;


struct OverlayData {
    float borderThickness;
    float fillStrength;
    float saturationShift;
};

uniform OverlayData u_overlayData;


struct TileBorderData {
    vec4 color;
    float zoomThreshold;
    float zoomMax;
    float minThickness;
    float maxThickness;
};

uniform TileBorderData u_tileBorderData;


struct FoWData {
    float strengthUnknown;
    float strengthDiscovered;
    float strengthVisible;
};

uniform FoWData u_foWData;


struct SelectionData {
    vec4 color;
    float thickness;
};

uniform SelectionData u_selectionData;


struct MouseOverData {
    vec4 color;
    float thickness;
};

uniform MouseOverData u_mouseOverData;


uniform bool u_grayscaleMode;

/*
a counter starting at 0, incrementing each frame and wrapping at an arbitrary number
*/
uniform float u_time;

/*
The current size of the screen/canvas
*/
uniform vec2 u_screenSize;

/*
The currently selected tile position
*/
uniform ivec2 u_selectedTile;

/*
The current tile position under the cursor
*/
uniform ivec2 u_mouseOverTile;

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
The entity mask texture
*/
uniform sampler2D u_entityMask;

/*
The prepared roads layer
*/
uniform sampler2D u_routes;

/*
The current zoom value of the camera
*/
uniform float u_zoom;

/*
The position/index of the tile (q,r)
*/
flat in ivec2 v_tilePosition;

/*
The position in world space (x,y) - before transformation for camera
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
information whether there is a coast (same as border) in a given direction - packed into a single integer
first bit = direction "0", second bit = direction "1", ...
*/
flat in int v_coastMask;

/*
information whether there is a border in a given direction - packed into a single integer
first bit = direction "0", second bit = direction "1", ...
*/
flat in int v_borderMask;

/*
color of the border
*/
in vec3 v_borderColor;

/*
fill color of the tile
*/
in vec3 v_fillColor;

/*
The final output color
*/
out vec4 outColor;


// ==================================//
//          UTILITY FUNCTIONS        //
// ==================================//

vec4 grayscale(vec4 color) {
    return vec4(vec3(color.r+color.g+color.b) / 3.0, color.a);
}

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

/*
return information about the borders in the current direction
x: whether there is a border in the previous direction
y: whether there is a border in the current direction
z: whether there is a border in the next direction
*/
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

/*
Whether the current pixel is in the area of a border (of the previus, current and next border direction).
Independent of whether there is an actual border according to a mask.
*/
vec3 borderMaskEdge(vec3 cornerData, float thickness) {
    float maskCurr = 1.0 - step(thickness, cornerData.x);
    float maskPrev = step(1.0 - thickness, cornerData.y);
    float maskNext = step(1.0 - thickness, cornerData.z);
    return vec3(maskPrev, maskCurr, maskNext);
}

/*
Whether the current pixel is in the area of a border. All directions and masks combined.
*/
float borderMaskCombine(vec3 directionMask, vec3 edgeMask) {
    vec3 borderValues = directionMask * edgeMask;
    return min(1.0, borderValues.x + borderValues.y + borderValues.z);
}

vec3 borderMaskGradient(vec3 cornerData) {
    float maskCurr = 1.0 - cornerData.x;
    float maskPrev = cornerData.y;
    float maskNext = cornerData.z;
    return vec3(maskPrev, maskCurr, maskNext);
}

float borderMaskCombineGradient(vec3 directionMask, vec3 gradientEdgeMask) {
    if (directionMask.x > 0.01 && directionMask.y < 0.01 && directionMask.z > 0.01) {
        return max(gradientEdgeMask.x * directionMask.x, gradientEdgeMask.z * directionMask.z);
    } else if (directionMask.y > 0.01) {
        return gradientEdgeMask.y;
    } else {
        return gradientEdgeMask.x * directionMask.x + gradientEdgeMask.z * directionMask.z;
    }
}

float borderEdge(vec3 cornerData, int edgeDirection, int mask, float thickness) {
    vec3 maskDirection = borderMaskDirection(mask, edgeDirection);
    vec3 maskEdge = borderMaskEdge(cornerData, thickness);
    float maskCombined = borderMaskCombine(maskDirection, maskEdge);
    return maskCombined;
}

float borderGradient(vec3 cornerData, int edgeDirection, int mask) {
    vec3 maskDirection = borderMaskDirection(mask, edgeDirection);
    vec3 maskEdge = borderMaskGradient(cornerData);
    float maskCombined = borderMaskCombineGradient(maskDirection, maskEdge);
    return maskCombined;
}


// ==================================//
//            BASE TEXTURES          //
// ==================================//

float baseTextureClouds(vec2 offset) {
    return texture(u_noise, (v_worldPosition + offset) / u_baseTextureData.scaleClouds).x;
}

float baseTexturePaper() {
    return texture(u_texture, v_worldPosition / u_baseTextureData.scalePaper).x;
}

float baseTexture(float basePaper, float baseClouds) {
    float paper = mix(1.0, basePaper, u_baseTextureData.strengthPaper);
    float clouds = mix(1.0, baseClouds, u_baseTextureData.strengthClouds);
    return paper * clouds;
}

// ==================================//
//            ENTITY MASK            //
// ==================================//

vec4 getEntityMask() {
    float mask = texture(u_entityMask, gl_FragCoord.xy / u_screenSize).g;
    return vec4(vec3(1.0), mask);
}


// ==================================//
//               ROUTES              //
// ==================================//

vec4 getRoutes() {
    return texture(u_routes, gl_FragCoord.xy / u_screenSize);
}

// ==================================//
//            PAPER LAYER            //
// ==================================//

vec4 colorLayerPaper(float textureBase, float textureClouds) {
    // define tint color (in hsv)
    vec3 tintColor0 = rgb2hsv(u_baseTextureData.colorLight);
    vec3 tintColor1 = rgb2hsv(u_baseTextureData.colorDark);
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
    float totalTiles = u_terrainTilesetData.totalTileCount;
    float slotSize = u_terrainTilesetData.slotSize;
    float gapSize = u_terrainTilesetData.gapSize;
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

vec4 coastBorder() {
    float thickness = u_oceanWaveData.thickness;
    float waveScale = u_oceanWaveData.waveScale;
    float waveTimeScale = u_oceanWaveData.waveTimeScale;
    float waveStrength = u_oceanWaveData.waveStrength;
    // masks
    float border = borderGradient(v_cornerData, v_edgeDirection, v_coastMask);
    float waves = (sin(border * waveScale - u_time * waveTimeScale) + 1.0) * 0.5;
    waves = waves * border * waveStrength;
    // color
    return mix(vec4(0.0), vec4(1.0), waves);
}

vec4 baseColorTerrain() {
    // color
    vec2 texCoords = tilesetTextureCoords(v_textureCoordinates, v_tilesetIndex);
    vec4 color = texture(u_tileset, texCoords);
    // apply coast color effect
    vec4 coast = coastBorder();
    color = vec4(color.rgb + coast.rgb, color.a);
    // resulting terrain color
    return color;
}

vec4 colorLayerTerrain(float textureBase) {
    vec4 baseColor = baseColorTerrain();
    return vec4(baseColor.rgb * textureBase, baseColor.a);
}

// ==================================//
//             ROUTE LAYER           //
// ==================================//

vec4 colorLayerRoutes() {
    vec4 routes = getRoutes();
    return vec4(u_baseTextureData.colorDark*0.3, routes.a);
}


// ==================================//
//            OVERLAY LAYER          //
// ==================================//

vec4 borderPrimary() {
    float thickness = u_overlayData.borderThickness;
    // border
    float border = borderEdge(v_cornerData, v_edgeDirection, v_borderMask, thickness);
    // color
    return mix(vec4(0.0), vec4(v_borderColor, 1.0), border);
}

vec4 fillColor(vec3 baseColor, float textureClouds) {
    float fillIntensity = u_overlayData.fillStrength;
    float saturationShift = u_overlayData.saturationShift;
    if (baseColor.r + baseColor.g + baseColor.b > 0.01) {
        vec3 baseColorHsv = rgb2hsv(baseColor);
        vec3 colorHsv0 = vec3(baseColorHsv.x, clamp(baseColorHsv.y-saturationShift, 0.0, 1.0), baseColorHsv.z);
        vec3 colorHsv1 = vec3(baseColorHsv.x, clamp(baseColorHsv.y+saturationShift, 0.0, 1.0), baseColorHsv.z);
        vec3 colorHsv = mix(colorHsv0, colorHsv1, textureClouds);
        vec3 colorRgb = hsv2rgb(colorHsv);
        return vec4(colorRgb, fillIntensity);
    } else {
        return vec4(0.0);
    }
}

vec4 colorLayerOverlay(float textureBase, float textureClouds) {
    // get borders
    vec4 primary = borderPrimary() * mix(1.0, textureBase, 0.3);
    // get fill
    vec4 fill = fillColor(v_fillColor, textureClouds);
    // combine
    vec4 color = vec4(0.0);
    color = mix(color, fill, fill.a);
    color = mix(color, primary, primary.a);
    return color;
}

// ==================================//
//               EFFECTS             //
// ==================================//

vec4 colorTileBorder(float zoom) {
    float zoomThreshold = u_tileBorderData.zoomThreshold;
    float zoomMax = u_tileBorderData.zoomMax;
    float minThickness = u_tileBorderData.minThickness;
    float maxThickness = u_tileBorderData.maxThickness;
    if (zoom < zoomThreshold) {
        return vec4(0.0);
    } else {
        float zoomPerc = smoothstep(zoomThreshold, zoomMax, zoom);
        float thickness = zoomPerc * (maxThickness - minThickness) + minThickness;
        float value = step(v_cornerData.x, thickness);
        return vec4(u_tileBorderData.color.rgb, value * u_tileBorderData.color.a);
    }
}

vec4 colorSelectionBorder(ivec2 tilePos) {
    if (tilePos.x == u_selectedTile.x && tilePos.y == u_selectedTile.y) {
        float value = step(v_cornerData.x, u_selectionData.thickness);
        return vec4(u_selectionData.color.rgb, value * u_selectionData.color.a);
    } else {
        return vec4(0.0);
    }
}

vec4 colorMouseOverBorder(ivec2 tilePos) {
    if (tilePos.x == u_mouseOverTile.x && tilePos.y == u_mouseOverTile.y) {
        float value = step(v_cornerData.x, u_mouseOverData.thickness);
        return vec4(u_mouseOverData.color.rgb, value * u_mouseOverData.color.a);
    } else {
        return vec4(0.0);
    }
}

vec4 applyFogOfWar(vec4 color) {
    if (v_visibility == 0) { // unknown
        return vec4(color.rgb * u_foWData.strengthUnknown, color.a);
    }
    if (v_visibility == 1) { // discovered
        return vec4(color.rgb * u_foWData.strengthDiscovered, color.a);
    }
    if (v_visibility == 2) { // visible
        return vec4(color.rgb * u_foWData.strengthVisible, color.a);
    }
    return color;
}

// ==================================//
//                MAIN               //
// ==================================//

void main() {

    // textures
    float texturePaper = baseTexturePaper();
    float textureClouds0 = baseTextureClouds(vec2(0.0));
    float textureClouds1 = baseTextureClouds(vec2(100.0, 200.0));
    float textureBase = baseTexture(texturePaper, textureClouds0);

    // entity mask
    vec4 entityMask = getEntityMask();

    // base layers
    vec4 layerPaper  = colorLayerPaper(textureBase, textureClouds0);
    vec4 layerTerrain = colorLayerTerrain(textureBase) * entityMask;
    vec4 layerRoutes = colorLayerRoutes() * entityMask;

    // combine base layers
    vec4 color = vec4(0.0);
    color = mix(color, layerPaper, layerPaper.a);
    color = mix(color, layerTerrain, layerTerrain.a);
    color = mix(color, layerRoutes, layerRoutes.a);

    // grayscale
    if (u_grayscaleMode) {
        color = grayscale(color);
    }

    // combine overlay-layer
    vec4 layerOverlay = colorLayerOverlay(textureBase, textureClouds1);
    color = mix(color, layerOverlay, layerOverlay.a);

    // effects
    vec4 effectTileBorder = colorTileBorder(u_zoom);
    vec4 effectSelectionBorder = colorSelectionBorder(v_tilePosition);
    vec4 effectMouseOverBorder = colorMouseOverBorder(v_tilePosition);

    // apply effects
    color = applyFogOfWar(color);
    color = mix(color, effectSelectionBorder, effectSelectionBorder.a);
    color = mix(color, effectMouseOverBorder, effectMouseOverBorder.a);
    color = mix(color, effectTileBorder, effectTileBorder.a);

    // result
    outColor = vec4(color.rgb, 1.0);
}
