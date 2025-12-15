#version 300 es
precision mediump float;

struct OverlayData {
    float borderThickness;
    float borderOpacity;
    float fillOpacity;
};

uniform OverlayData u_overlay;

struct TileSelectionData {
    ivec2 position;
    float thickness;
    vec4 color0;
    vec4 color1;
};

uniform TileSelectionData u_tileSelection;

uniform ivec2 u_tileHovered;

struct HighlightData {
    float gap;
    vec4 colorInnerDefault;
    vec4 colorOuterDefault;
    vec4 colorInnerHover;
    vec4 colorOuterHover;
    vec4 colorInnerActive;
    vec4 colorOuterActive;
};

uniform HighlightData u_highlightData;

in vec2 v_textureCoordinates;
flat in ivec2 v_tilePosition;
in vec2 v_worldCoordinates;
in vec3 v_cornerData;
flat in uint v_directionData;

flat in uint v_borderMask;
in vec4 v_borderColor;
in vec4 v_fillColor;

flat in uint v_highlight;


uniform sampler2D u_noise;
uniform float u_time;

out vec4 outColor;

#include border
#include color

// ==================================//
//          UTILITIES                //
// ==================================//

/*
Bit test by 0-based index
*/
bool checkBit(uint value, uint bitIndex) {
    return ((value >> bitIndex) & 1u) != 0u;
}

// whether the two given ivec2 are equal
bool isEqual(ivec2 a, ivec2 b) {
    return a.x == b.x && a.y == b.y;
}

// mask for tile fill colors, i.e. where to paint fill (="1") and where not to (="0")
float getFillMask(vec3 cornerData, uint edgeDirection, uint mask) {
    return 1.0 - border(cornerData, edgeDirection, mask, 0.15);
}

vec2 getVariableThickness(float thickness, float scaleFactor, float thicknessFactor) {
    vec2 tilePos = vec2(float(v_tilePosition.x), float(v_tilePosition.y));
    float randomOuter = texture(u_noise, vec2(v_cornerData.y * scaleFactor, 0.2) + tilePos).r;
    float randomInner = texture(u_noise, vec2(v_cornerData.y * scaleFactor, 0.3) + tilePos).r;
    float thicknessOuter = randomOuter * thicknessFactor;
    float thicknessInner = randomInner * thicknessFactor + thickness;
    return vec2(thicknessOuter, thicknessInner);
}

// randomly offsets the given colors based on alphaShiftFactor and hueShiftFactor
vec4 modulateColor(vec4 color, float alphaShiftFactor, float hueShiftFactor) {

    float noise1 = texture(u_noise, v_worldCoordinates * 0.005 + vec2(0.4, -0.2)).r;
    float noise0 = texture(u_noise, v_worldCoordinates * 0.005).r;

    float noiseAlpha = (noise0 * alphaShiftFactor) - (alphaShiftFactor / 2.0);
    float alpha = clamp(color.a * (1.0 + noiseAlpha), 0.0, 1.0);

    float hueShift = 0.1;
    float noiseHue = (noise1 * hueShift) - (hueShift / 2.0);

    vec3 colorHsv = rgb2hsv(color.rgb);
    vec3 shiftedHsv = vec3(
    clamp(colorHsv.x + noiseHue, 0.0, 1.0),
    colorHsv.y,
    colorHsv.z
    );
    vec3 colorRgb = hsv2rgb(shiftedHsv);

    return vec4(colorRgb.rgb, alpha);
}

// bounce between the two given colors based on u_time
vec4 bounceColor(vec4 color0, vec4 color1, float speedFactor) {
    float t = (sin(u_time * speedFactor) + 1.0) / 2.0;
    return mix(color1, color0, t);
}

// ==================================//
//          PRIMARY BORDER           //
// ==================================//

vec4 getPrimaryBorder(vec4 color, vec3 cornerData, uint edgeDirection, uint mask) {
    float randomThicknessFactor = 0.1;
    float randomScaleFactor = 0.5;
    vec2 thickness = getVariableThickness(u_overlay.borderThickness, randomScaleFactor, randomThicknessFactor);
    float border = border_variableThickness(cornerData, edgeDirection, mask, thickness.x, thickness.y);
    return mix(vec4(0.0), vec4(color.rgb, color.a * u_overlay.borderOpacity), border);
}


// ==================================//
//          PRIMARY FILL             //
// ==================================//

vec4 getPrimaryFill(vec4 color) {
    float alphaShiftFactor = 0.3;
    float hueShiftFactor = 0.1;
    return modulateColor(color * vec4(vec3(1.0), u_overlay.fillOpacity), alphaShiftFactor, hueShiftFactor);
}


// ==================================//
//            HIGHLIGHT              //
// ==================================//

vec4 getHighlightActive() {
    if(!checkBit(v_highlight, 0u)) {
        return vec4(0.0);
    }
    float randomThicknessFactor = 0.1;
    float randomScaleFactor = 0.5;
    vec2 thickness = getVariableThickness(u_tileSelection.thickness, randomScaleFactor, randomThicknessFactor);
    float border = border_full_variableThickness(v_cornerData, thickness.x, thickness.y);
    vec4 color = bounceColor(u_tileSelection.color0, u_tileSelection.color1, 1.0);
    return vec4(color.rgb, color.a * border);
}


vec4 getHighlightOption() {
    if(!checkBit(v_highlight, 1u)) {
        return vec4(0.0);
    }
    if(checkBit(v_highlight, 2u)) {
        return vec4(0.0);
    }

    float alphaShiftFactor = 0.3;
    float hueShiftFactor = 0.1;

    float gap = border_full(v_cornerData, u_highlightData.gap);
    float gradient = border_full_gradient(v_cornerData);

    vec4 baseColorInner = u_highlightData.colorInnerDefault;
    vec4 baseColorOuter = u_highlightData.colorOuterDefault;
    if (u_tileHovered.x == v_tilePosition.x && u_tileHovered.y == v_tilePosition.y) {
        baseColorInner = u_highlightData.colorInnerHover;
        baseColorOuter = u_highlightData.colorOuterHover;
    }

    vec4 colorInner = modulateColor(baseColorInner, alphaShiftFactor, hueShiftFactor);
    vec4 colorOuter = modulateColor(baseColorOuter, alphaShiftFactor, hueShiftFactor);
    vec4 color = mix(colorInner, colorOuter, gradient);

    return color * vec4(vec3(1.0), 1.0-gap);
}


vec4 getHighlightOptionSelected() {
    if(!checkBit(v_highlight, 2u)) {
        return vec4(0.0);
    }

    float alphaShiftFactor = 0.3;
    float hueShiftFactor = 0.1;

    float gap = border_full(v_cornerData, u_highlightData.gap);
    float gradient = border_full_gradient(v_cornerData);

    vec4 baseColorInner = u_highlightData.colorInnerActive;
    vec4 baseColorOuter = u_highlightData.colorOuterActive;

    vec4 colorInner = modulateColor(baseColorInner, alphaShiftFactor, hueShiftFactor);
    vec4 colorOuter = modulateColor(baseColorOuter, alphaShiftFactor, hueShiftFactor);
    vec4 color = mix(colorInner, colorOuter, gradient);

    return color * vec4(vec3(1.0), 1.0-gap);
}


// ==================================//
//          TILE BORDER              //
// ==================================//

vec4 getTileBorder() {
    float border = border_full(v_cornerData, 0.01);
    return vec4(vec3(0.0), border);
}

// ==================================//
//          MAIN                     //
// ==================================//

void main() {

    float fillMask = getFillMask(v_cornerData, v_directionData, v_borderMask);

    vec4 colorPrimaryFill = getPrimaryFill(v_fillColor) * fillMask;
    vec4 colorPrimaryBorder = getPrimaryBorder(v_borderColor, v_cornerData, v_directionData, v_borderMask);

    vec4 colorHighlightActive = getHighlightActive();
    vec4 colorHighlightOption = getHighlightOption();
    vec4 colorHighlightSelectedOption = getHighlightOptionSelected();

    vec4 color = vec4(0.0);
    color = clr_blend(colorPrimaryFill, color);
    color = clr_blend(colorPrimaryBorder, color);
    color = clr_blend(colorHighlightOption, color);
    color = clr_blend(colorHighlightSelectedOption, color);
    color = clr_blend(colorHighlightActive, color);

    outColor = color;
}
