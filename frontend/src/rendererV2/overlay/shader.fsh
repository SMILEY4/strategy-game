#version 300 es
precision mediump float;

uniform ivec2 u_selectedTile;
uniform ivec2 u_hoverTile;
uniform vec2 u_screenSize;

uniform sampler2D u_world;
uniform sampler2D u_paper;
uniform sampler2D u_noise;
uniform sampler2D u_noisePainted;

in vec3 v_cornerData;
in vec2 v_worldPosition;
flat in int v_directionData;
flat in ivec2 v_tilePosition;

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
//                MAIN               //
// ==================================//

vec3 colorWorld() {
    return texture(u_world, gl_FragCoord.xy / u_screenSize).rgb;
}

vec4 worldTexture(sampler2D sampler, float scale) {
    return texture(sampler, v_worldPosition / scale);
}

float baseTexturePaper() {
    float strength = 1.0;// => values in [1.0-"strength", 1.0]
    float value = worldTexture(u_paper, 90.0).x;
    value = value * strength + (1.0-strength);
    return value;
}

float baseTextureNoise() {
    float paintStrength = 1.0;
    float strength = 0.2;
    float valueNoise = worldTexture(u_noise, 90.0).x;
    float valueNoisePainted = worldTexture(u_noisePainted, 90.0).x;
    float value = mix(valueNoise, valueNoisePainted, paintStrength);
    value = value * strength + (1.0-strength);
    return value;
}

vec4 colorSelectionBorder(float thickness, vec4 color) {
    if (v_tilePosition.x == u_selectedTile.x && v_tilePosition.y == u_selectedTile.y) {
        float value = step(v_cornerData.x, thickness);
        return vec4(color.rgb, value * color.a);
    } else {
        return vec4(0.0);
    }
}

vec4 colorMouseOverBorder(float thickness, vec4 color) {
    if (v_tilePosition.x == u_hoverTile.x && v_tilePosition.y == u_hoverTile.y) {
        float value = step(v_cornerData.x, thickness);
        return vec4(color.rgb, value * color.a);
    } else {
        return vec4(0.0);
    }
}

void main() {

    vec3 colorParchmentLight = vec3(235.0, 213.0, 179.0) / vec3(255.0);
    vec3 colorParchmentDark = vec3(207.0, 175.0, 124.0) / vec3(255.0) * 0.75;
    float texturePaper = baseTexturePaper();
    float textureNoise = baseTextureNoise();
    vec3 parchment = mix(colorParchmentLight, colorParchmentDark, textureNoise*texturePaper);

    vec4 effectSelectionBorder = colorSelectionBorder(0.15, vec4(189.0/255.0, 23.0/255.0, 64.0/255.0, 1.0));
    vec4 effectMouseOverBorder = colorMouseOverBorder(0.08, vec4(186.0/255.0, 47.0/255.0, 107.0/255.0, 1.0));

    vec4 color = vec4(colorWorld(), 1.0);
    color = mix(color, effectSelectionBorder, effectSelectionBorder.a);
    color = mix(color, effectMouseOverBorder, effectMouseOverBorder.a);

    color = mix(color, vec4(parchment, 1.0), 0.2);
    color = vec4(color.rgb * vec3(mix(textureNoise*(1.0-texturePaper), 1.0, 0.8)), color.a);

    vec3 colorLight = mix(color.rgb, colorParchmentLight, 0.2);
    color = vec4(mix(colorLight, color.rgb, (texturePaper*texturePaper*textureNoise)+0.6), color.a);

    outColor = color;

}
