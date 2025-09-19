// ==================================//
//          INTERNAL                 //
// ==================================//

/*
Bit test by 0-based index
*/
bool border_checkBit(uint value, uint bitIndex) {
    return ((value >> bitIndex) & 1u) != 0u;
}

/*
return information about the borders in the current direction
x: whether there is a border in the previous direction (0.0 or 1.0)
y: whether there is a border in the current direction (0.0 or 1.0)
z: whether there is a border in the next direction (0.0 or 1.0)
*/
vec3 border_maskDirection(uint mask, uint edgeDirection) {
    // get direction indices
    uint dirPrev = (edgeDirection + 5u) % 6u; // -1 % 6
    uint dirCurr = edgeDirection % 6u;
    uint dirNext = (edgeDirection + 1u) % 6u; // +1 % 6
    // check if bit in mask is set
    float prev = border_checkBit(mask, dirPrev) ? 1.0 : 0.0;
    float curr = border_checkBit(mask, dirCurr) ? 1.0 : 0.0;
    float next = border_checkBit(mask, dirNext) ? 1.0 : 0.0;
    // return result in vector
    return vec3(prev, curr, next);
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
Returns wether the given current is inside a border area defined by the given mask and thickness.
This can produces a border only for specific edges/directions.
Thickness is the percentage (from 0 to 1) the border takes up of the tile measured from the outside.
*/
float border(vec3 cornerData, uint edgeDirection, uint mask, float thickness) {
    vec3 maskDirection = border_maskDirection(mask, edgeDirection);
    vec3 maskEdge = border_maskEdge(cornerData, thickness);
    return border_combineMasks(maskDirection, maskEdge);
}

/*
Returns wether the given current is inside a border area defined by the given mask and thickness.
This can produces a border only for specific edges/directions.
Thickness is the percentage (from 0 to 1) the border takes up of the tile measured from the outside.
Note: "thicknessFrom" < "thicknessTo"
*/
float border_variableThickness(vec3 cornerData, uint edgeDirection, uint mask, float thicknessFrom, float thicknessTo) {
    float borderOuter = border(cornerData, edgeDirection, mask, thicknessFrom);
    float borderInner = border(cornerData, edgeDirection, mask, thicknessTo);
    if(borderOuter > 0.1) {
        return 0.0;
    } else {
        return borderInner;
    }
}

/*
Return a gradient border from the edge to the center taking the given mask into account.
*/
float border_gradient(vec3 cornerData, uint edgeDirection, uint mask) {
    vec3 maskDirection = border_maskDirection(mask, edgeDirection);
    vec3 maskEdge = border_maskGradientEdge(cornerData);
    return border_combineMasksGradient(maskDirection, maskEdge);
}

/*
Return whether the current pixel is inside a border area defined only by the given thickness.
This produces a border full 360 degree border (which is simpler to calculate).
Thickness is the percentage (from 0 to 1) the border takes up of the tile measured from the outside.
*/
float border_full(vec3 cornerData, float thickness) {
    return step(cornerData.x, thickness);
}

/*
Return whether the current pixel is inside a border area defined only by the given thickness.
This produces a border full 360 degree border (which is simpler to calculate).
Thickness is the percentage (from 0 to 1) the border takes up of the tile measured from the outside.
Note: "thicknessFrom" < "thicknessTo"
*/
float border_full_variableThickness(vec3 cornerData, float thicknessFrom, float thicknessTo) {
    float borderOuter = border_full(cornerData, thicknessFrom);
    float borderInner = border_full(cornerData, thicknessTo);
    if(borderOuter > 0.1) {
        return 0.0;
    } else {
        return borderInner;
    }
}

/*
Return a gradient border from the edge to the center.
*/
float border_full_gradient(vec3 cornerData) {
    return 1.0 - cornerData.x;
}