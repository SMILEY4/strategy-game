#version 300 es
precision mediump float;

struct CommonData {
    float timestamp;
    mat3 invViewProjection;
    int isGrayscale;
    sampler2D noise;
};

uniform CommonData u_common;

struct WaterData {
    sampler2D layer;
    vec3 colorLight;
    vec3 colorDark;
    float waveDistortionStrength;
    float waveDistortionScale;
    float waveSpeed;
    float waveSharpnesss;
};

uniform WaterData u_water;

struct LandData {
    sampler2D layer;
    float cutoff;
    float outlineSizeLight;
    float outlineSizeDark;
};

uniform LandData u_land;

struct FogData {
    sampler2D layer;
    vec4 colorUnknown;
    vec4 colorDiscovered;
};

uniform FogData u_fog;


struct MapDetailsData {
    sampler2D layer;
};

uniform MapDetailsData u_mapDetails;


struct OverlayData {
    sampler2D layer;
};

uniform OverlayData u_overlay;

struct PaperLayerData {
    sampler2D texture;
    float scale;
    float strength;
    float contrast;
};

struct PaperData {
    PaperLayerData small;
    PaperLayerData medium;
    PaperLayerData large;
    PaperLayerData clouds;
};

uniform PaperData u_paper;

uniform float u_lutSize;
uniform sampler2D u_lutColorCorrection;

in vec2 v_textureCoordinates;

out vec4 outColor;


#include color
#include map
#include lut

/*
 * sample the pixel-color from a framebuffer at the given uv-coords
*/
vec4 framebuffer(sampler2D fb, vec2 coords) {
    return clr_reversePremultAlpha(texture(fb, coords));
}

vec4 convertGrayscale(vec4 color) {
    vec3 parchmentLight = (vec3(252.0, 245.0, 229.0) / vec3(255.0));
    vec3 parchmentDark = (vec3(77.0, 55.0, 24.0) / vec3(255.0)) * 0.3;
    float gray = (color.r + color.g + color.b) * 0.3;
    gray = pow(gray, 0.75);
    vec3 grayColor = mix(parchmentLight, parchmentDark, 1.0-gray);
    return vec4(grayColor, color.a);
}

// ==================================//
//          LAYER: WATER             //
// ==================================//

vec3 getWaterColor(WaterData data, vec4 layer) {
    return mix(data.colorLight, data.colorDark, layer.r);
}

vec3 getWaves(WaterData data, vec4 layer, vec2 mapPosition) {
    float depth = clamp(layer.g / 0.8, 0.0, 1.0);
    float noise = texture(u_common.noise, mapPosition*data.waveDistortionScale).r  * u_water.waveDistortionStrength + (1.0-u_water.waveDistortionStrength);
    float waves = sin(depth*40.0 * noise - u_common.timestamp*data.waveSpeed) * pow(depth, data.waveSharpnesss);
    waves = clamp(waves, 0.0, 0.8);
    return vec3(waves);
}

vec4 getLayerWater() {
    vec2 mapPosition = map_screenToWorld(u_common.invViewProjection, v_textureCoordinates);
    vec4 layer = framebuffer(u_water.layer, v_textureCoordinates);
    vec3 waves = getWaves(u_water, layer, mapPosition);
    vec3 color = getWaterColor(u_water, layer);
    return vec4(color + waves, layer.a);
}


// ==================================//
//          LAYER: LAND              //
// ==================================//

float isLand(vec2 pos, float cutoff) {
    float land = framebuffer(u_land.layer, pos).a;
    return land >= u_land.cutoff ? 1.0 : 0.0;
}

float isOutlineLand(float size, float cutoff) {
    float outline = 0.0;
    outline += isLand(v_textureCoordinates + vec2(-size, 0), cutoff);
    outline += isLand(v_textureCoordinates + vec2(0, size), cutoff);
    outline += isLand(v_textureCoordinates + vec2(size, 0), cutoff);
    outline += isLand(v_textureCoordinates + vec2(0, -size), cutoff);
    outline += isLand(v_textureCoordinates + vec2(-size, size), cutoff);
    outline += isLand(v_textureCoordinates + vec2(size, size), cutoff);
    outline += isLand(v_textureCoordinates + vec2(-size, -size), cutoff);
    outline += isLand(v_textureCoordinates + vec2(size, -size), cutoff);
    outline = min(outline/2.0, 1.0);
    return clamp(outline - isLand(v_textureCoordinates, cutoff), 0.0, 1.0);
}

vec4 getOutlineLand(LandData data) {
    vec3 layer = framebuffer(u_land.layer, v_textureCoordinates).rgb;
    vec4 outlineLight = mix(vec4(0.0), vec4(vec3(1.5), 1.0), isOutlineLand(data.outlineSizeLight, data.cutoff));
    vec4 outlineDark = mix(vec4(0.0), vec4(layer*0.3, 1.0), isOutlineLand(data.outlineSizeDark, data.cutoff));
    vec4 color = vec4(0.0);
    color = mix(color, outlineLight, outlineLight.a);
    color = mix(color, outlineDark, outlineDark.a);
    return color;
}

vec4 getLayerLand() {
    vec4 layer = framebuffer(u_land.layer, v_textureCoordinates);
    vec4 color =  vec4(layer.rgb, layer.a >= u_land.cutoff ? 1.0 : 0.0);
    vec4 outline = getOutlineLand(u_land);
    return mix(color, outline, outline.a);
}


// ==================================//
//          LAYER: FOG               //
// ==================================//

vec4 getLayerFog() {
    vec4 layer = framebuffer(u_fog.layer, v_textureCoordinates);
    float factorUnknown = 1.0 - clamp(layer.r+layer.g+layer.b, 0.0, 1.0);
    float factorVisible = layer.r;
    return mix(mix(u_fog.colorDiscovered, vec4(0.0), factorVisible), u_fog.colorUnknown, factorUnknown);
}

// ==================================//
//          LAYER: MAP DETAILS       //
// ==================================//

vec4 getLayerMapDetails() {
    return framebuffer(u_mapDetails.layer, v_textureCoordinates);
}


// ==================================//
//          LAYER: OVERLAY           //
// ==================================//

vec4 getLayerOverlay() {
    return framebuffer(u_overlay.layer, v_textureCoordinates);
}

// ==================================//
//          EFFECT: PAPER            //
// ==================================//

float getPaperLayer(PaperLayerData data, vec2 mapPosition) {
    float value = texture(data.texture, mapPosition*vec2(data.scale)).r * data.strength + (1.0-data.strength);
    return pow(value, data.contrast);
}

vec3 getPaperTexture(float whitepoint) {
    vec2 mapPosition = map_screenToWorld(u_common.invViewProjection, v_textureCoordinates);
    float large = getPaperLayer(u_paper.large, mapPosition);
    float medium = getPaperLayer(u_paper.medium, mapPosition);
    float small = getPaperLayer(u_paper.small, mapPosition);
    float clouds = getPaperLayer(u_paper.clouds, mapPosition);
    float combined = large * medium * small * clouds;
    combined = combined * (1.0 / whitepoint);
    return vec3(combined);
}

vec4 applyEffectPaper(vec4 color) {
    vec3 paper = getPaperTexture(0.85882);
    return vec4(color.rgb * paper, color.a);
}

// ==================================//
//          EFFECT: COLOR CORRECT    //
// ==================================//

vec4 applyEffectColorCorrection(vec4 color) {
    vec3 lutColor = lut_sample(u_lutColorCorrection, clamp(color.rgb, vec3(0.0), vec3(1.0)), u_lutSize).rgb;
    return vec4(lutColor, color.a);
}

// ==================================//
//          MAIN                     //
// ==================================//

void main() {
    vec4 water = getLayerWater();
    vec4 land = getLayerLand();
    vec4 fog = getLayerFog();
    vec4 mapDetails = getLayerMapDetails();
    vec4 overlay = getLayerOverlay();

    // grayscale
    if (u_common.isGrayscale > 0) {
        water = convertGrayscale(water);
        land = convertGrayscale(land);
        mapDetails = convertGrayscale(mapDetails);
    }

    // combine layers
    vec4 color = vec4(0.0);
    color = clr_blend(water, color);
    color = clr_blend(land, color);
    color = clr_blend(mapDetails, color);

    // color correct
    color = applyEffectColorCorrection(color);

    // apply remaining layers
    color = clr_blend(fog, color);
    color = clr_blend(overlay, color);

    // apply paper effect
    color = applyEffectPaper(color);

    outColor = color;
}