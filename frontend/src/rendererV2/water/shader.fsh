#version 300 es
precision mediump float;

uniform sampler2D u_noise;

in vec3 v_cornerData;
in vec2 v_worldPosition;
flat in int v_edgeDirection;
flat in int v_borderMask;
flat in int v_visibility;

out vec4 outColor;

// ==================================//
//          UTILITY FUNCTIONS        //
// ==================================//

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

void main() {


    vec3 colorDeep = vec3(0.71, 0.784, 0.776);
    vec3 colorShallow = vec3(0.504, 0.614, 0.653);
    vec3 colorWave = vec3(0.91, 0.984, 0.976);
    float waveScale = 20.0;
    float waveSize = 0.2;
    float waveDistortion = 0.25;

    float noiseLarge = texture(u_noise, v_worldPosition/200.0).r * 0.4 + 0.6;
    float noiseSmall = texture(u_noise, v_worldPosition/30.0).r * waveDistortion + (1.0-waveDistortion);

    float depth = 1.0-borderGradient(v_cornerData, v_edgeDirection, v_borderMask);

    float waves = step((1.0 - waveSize), sin((depth*noiseSmall) * waveScale)) * (1.0-depth);

    vec3 color = mix(colorShallow, colorDeep, 1.0-(noiseLarge*depth));
    color = mix(color, colorWave, waves);

    float saturation = 1.0;
    if(v_visibility == 0) saturation = 0.0;
    if(v_visibility == 1) saturation = 0.5;
    if(v_visibility == 2) saturation = 1.0;

    float brightness = 1.0;
    if(v_visibility == 0) brightness = 1.0;
    if(v_visibility == 1) brightness = 0.6;
    if(v_visibility == 2) brightness = 1.0;

    vec3 grayscale = vec3((color.r+color.g+color.b)/3.0);

    outColor = vec4(mix(grayscale, color, saturation) * brightness, 1.0);

}
