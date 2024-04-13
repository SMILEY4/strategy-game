#version 300 es
precision mediump float;

struct OverlayData {
    float borderThickness;
    float borderOpacity;
    float fillOpacity;
};

uniform OverlayData u_overlay;

struct TileMouseOverData {
    ivec2 position;
    float thickness;
    vec4 color;
};

uniform TileMouseOverData u_tileMouseOver;

struct TileSelectionData {
    ivec2 position;
    float thickness;
    vec4 color;
};

uniform TileSelectionData u_tileSelection;

in vec2 v_textureCoordinates;
flat in ivec2 v_tilePosition;
in vec3 v_cornerData;
flat in int v_directionData;
flat in int v_borderMask;
in vec4 v_borderColor;
in vec4 v_fillColor;

out vec4 outColor;

#include border

// ==================================//
//          UTILITIES                //
// ==================================//

bool isEqual(ivec2 a, ivec2 b) {
    return a.x == b.x && a.y == b.y;
}

// ==================================//
//          FILL                     //
// ==================================//

vec4 getFill(vec4 color) {
    return vec4(color.rgb, color.a * u_overlay.fillOpacity);
}


// ==================================//
//          BORDER                   //
// ==================================//

vec4 getBorder(vec4 color, vec3 cornerData, int edgeDirection, int mask) {
    float border = border(cornerData, edgeDirection, mask, u_overlay.borderThickness);
    return mix(vec4(0.0), vec4(color.rgb, color.a * u_overlay.borderOpacity), border);
}


// ==================================//
//          MOUSE OVER               //
// ==================================//

vec4 getMouseOver() {
    if(isEqual(v_tilePosition, u_tileMouseOver.position)) {
        float border = border_full(v_cornerData, u_tileMouseOver.thickness);
        return vec4(u_tileMouseOver.color.rgb, u_tileMouseOver.color.a * border);
    } else {
        return vec4(0.0);
    }
}


// ==================================//
//          SELECTED TILE            //
// ==================================//

vec4 getSelection() {
    if(isEqual(v_tilePosition, u_tileSelection.position)) {
        float border = border_full(v_cornerData, u_tileSelection.thickness);
        return vec4(u_tileSelection.color.rgb, u_tileSelection.color.a * border);
    } else {
        return vec4(0.0);
    }
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

    vec4 colorFill = getFill(v_fillColor);
    vec4 colorBorder = getBorder(v_borderColor, v_cornerData, v_directionData, v_borderMask);
    vec4 colorMouseOver = getMouseOver();
    vec4 colorSelection = getSelection();
    vec4 colorTileBorder = getTileBorder();

    vec4 color = vec4(0.0);
    color = mix(color, colorFill, colorFill.a);
    color = mix(color, colorBorder, colorBorder.a);
    color = mix(color, colorSelection, colorSelection.a);
    color = mix(color, colorMouseOver, colorMouseOver.a);
    //color = mix(color, colorTileBorder, colorTileBorder.a);

    outColor = color;
}
