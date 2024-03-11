// ==================================//
//          INTERNAL                 //
// ==================================//


/*
check whether the bit at the given digit-position is set (i.e =1) for the given value.
Only digit-positions from 1 to 6 are allowed
*/
bool border_checkBit(int value, int digit) {
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
x: whether there is a border in the previous direction (0.0 or 1.0)
y: whether there is a border in the current direction (0.0 or 1.0)
z: whether there is a border in the next direction (0.0 or 1.0)
*/
vec3 border_maskDirection(int mask, int edgeDirection) {
    // get direction indices
    int dirPrev = (edgeDirection-1) < 0 ? 5 : edgeDirection-1;
    int dirCurr = edgeDirection;
    int dirNext = int(mod(float(edgeDirection+1), 6.0));
    // check if bit in mask is set
    bool isPrev = border_checkBit(mask, dirPrev+1);
    bool isCurr = border_checkBit(mask, dirCurr+1);
    bool isNext = border_checkBit(mask, dirNext+1);
    // as float values - either 0 or 1
    return vec3((isPrev ? 1.0 : 0.0), (isCurr ? 1.0 : 0.0), (isNext ? 1.0 : 0.0));
}

/*
Whether the current pixel is in the area of a border (of the previous, current and next border direction).
Independent of whether there is an actual border according to a mask.
*/
vec3 border_maskEdge(vec3 cornerData, float thickness) {
    float maskCurr = 1.0 - step(thickness, cornerData.x);
    float maskPrev = step(1.0 - thickness, cornerData.y);
    float maskNext = step(1.0 - thickness, cornerData.z);
    return vec3(maskPrev, maskCurr, maskNext);
}

/*
Whether the current pixel is in the area of a border (of the previous, current and next border direction) and
how far it is from the tile center. Independent of whether there is an actual border according to a mask.
*/
vec3 border_maskGradientEdge(vec3 cornerData) {
    float maskCurr = 1.0 - cornerData.x;
    float maskPrev = cornerData.y;
    float maskNext = cornerData.z;
    return vec3(maskPrev, maskCurr, maskNext);
}


/*
Combines the different border masks. Returns whether the current pixel is in the area of a border.
*/
float border_combineMasks(vec3 directionMask, vec3 edgeMask) {
    vec3 borderValues = directionMask * edgeMask;
    return min(1.0, borderValues.x + borderValues.y + borderValues.z);
}

/*
Combines the different border masks. Returns whether the current pixel is in the area of a border and how
far it is from the tile center.
*/
float border_combineMasksGradient(vec3 directionMask, vec3 gradientEdgeMask) {
    if (directionMask.x > 0.01 && directionMask.y < 0.01 && directionMask.z > 0.01) {
        return max(gradientEdgeMask.x * directionMask.x, gradientEdgeMask.z * directionMask.z);
    } else if (directionMask.y > 0.01) {
        return gradientEdgeMask.y;
    } else {
        return gradientEdgeMask.x * directionMask.x + gradientEdgeMask.z * directionMask.z;
    }
}


// ==================================//
//          PUBLIC                   //
// ==================================//

/*
Returns wether the given current is inside a border area defined by the given mask and thickness
*/
float border(vec3 cornerData, int edgeDirection, int mask, float thickness) {
    vec3 maskDirection = border_maskDirection(mask, edgeDirection);
    vec3 maskEdge = border_maskEdge(cornerData, thickness);
    return border_combineMasks(maskDirection, maskEdge);
}

/*
Return whether the current pixel is inside a border area defined only by the given thickness
*/
float border_full(vec3 cornerData, float thickness) {
    return step(cornerData.x, thickness);
}

/*
Return a gradient border from the edge to the center taking the given mask into account.
*/
float border_gradient(vec3 cornerData, int edgeDirection, int mask) {
    vec3 maskDirection = border_maskDirection(mask, edgeDirection);
    vec3 maskEdge = border_maskGradientEdge(cornerData);
    return border_combineMasksGradient(maskDirection, maskEdge);
}