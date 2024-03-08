#version 300 es
precision mediump float;

uniform ivec2 u_tileMouseOver;
uniform ivec2 u_tileSelected;

in vec2 v_textureCoordinates;
flat in ivec2 v_tilePosition;
in vec3 v_cornerData;
flat in int v_directionData;
flat in int v_borderMask;
in vec4 v_borderColor;
in vec4 v_fillColor;

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

vec4 getFill(vec4 color) {
    return vec4(color.rgb, color.a*0.7);
}

vec4 getBorder(vec4 color, vec3 cornerData, int edgeDirection, int mask) {
    float thickness = 0.15;
    float border = borderEdge(cornerData, edgeDirection, mask, thickness);
    return mix(vec4(0.0), color, border);
}

vec4 getMouseOver(float thickness, vec4 color) {
    if (v_tilePosition.x == u_tileMouseOver.x && v_tilePosition.y == u_tileMouseOver.y) {
        float value = step(v_cornerData.x, thickness);
        return vec4(color.rgb, value * color.a);
    } else {
        return vec4(0.0);
    }
}


vec4 getSelection(float thickness, vec4 color) {
    if (v_tilePosition.x == u_tileSelected.x && v_tilePosition.y == u_tileSelected.y) {
        float value = step(v_cornerData.x, thickness);
        return vec4(color.rgb, value * color.a);
    } else {
        return vec4(0.0);
    }
}

void main() {

    vec4 colorFill = getFill(v_fillColor);
    vec4 colorBorder = getBorder(v_borderColor, v_cornerData, v_directionData, v_borderMask);
    vec4 colorMouseOver = getMouseOver(0.08, vec4(186.0/255.0, 47.0/255.0, 107.0/255.0, 1.0));
    vec4 colorSelection = getSelection(0.15, vec4(189.0/255.0, 23.0/255.0, 64.0/255.0, 1.0));

    vec4 color = vec4(0.0);
    color = mix(color, colorFill, colorFill.a);
    color = mix(color, colorBorder, colorBorder.a);
    color = mix(color, colorSelection, colorSelection.a);
    color = mix(color, colorMouseOver, colorMouseOver.a);

    outColor = color;
}
