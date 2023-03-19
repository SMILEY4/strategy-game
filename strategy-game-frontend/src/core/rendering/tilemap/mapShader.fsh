#version 300 es
#line 2
precision mediump float;

uniform vec2 u_tileMouseOver;
uniform vec2 u_tileSelected;
uniform int u_mapMode;

flat in vec2 v_tilePosition;
in vec3 v_cornerData;
flat in vec3 v_terrainData;

flat in vec3 v_layer_values_country;
flat in vec3 v_layer_values_city;

flat in vec3 v_layer_borders_country;
flat in vec3 v_layer_borders_city;

out vec4 outColor;

#pragma useModule(terrainColor)

#pragma useModule(grayscaleColor)

#pragma useModule(blend)

#pragma useModule(eqFloat)
#pragma useModule(eqVec2)
#pragma useModule(isTrueFloat)


vec3 calcGrayscaleTerrainColor(float terrainId) {
    vec3 terrainColor = terrainColor(v_terrainData.x);
    return grayscaleColor(terrainColor, 1.75);
}


vec3 calcResourceColor(float resourceId) {
    if (eqFloat(resourceId, 0.0)) { // 0 -> forest
        return vec3(21.0 / 255.0, 112.0 / 255.0, 49.0 / 255.0);
    }
    if (eqFloat(resourceId, 1.0)) { // 1 -> fish
        return vec3(57.0 / 255.0, 96.0 / 255.0, 204.0 / 255.0);
    }
    if (eqFloat(resourceId, 2.0)) { // 2 -> stone
        return vec3(74.0 / 255.0, 74.0 / 255.0, 74.0 / 255.0);
    }
    if (eqFloat(resourceId, 3.0)) { // 3 -> metal
        return vec3(150.0 / 255.0, 150.0 / 255.0, 150.0 / 255.0);
    }
    return vec3(0.0);
}

vec3 applyFogOfWar(vec3 color, float visibilityId) {
    if (eqFloat(visibilityId, 0.0)) { // 0 -> undiscovered
        return vec3(0.2);
    }
    if (eqFloat(visibilityId, 1.0)) { // 1 -> discovered
        return mix(color, vec3(0.2), 0.5);
    }
    if (eqFloat(visibilityId, 2.0)) { // 2 -> visible
        return color;
    }
    return vec3(0.2);
}


bool isMouseOver(vec2 tilePos) {
    return eqVec2(u_tileMouseOver, tilePos);
}


bool isSelected(vec2 tilePos) {
    return eqVec2(u_tileSelected, tilePos);
}


bool isBorder(float distToCenter, float distToCornerA, float distToCornerB, vec3 borderData, float size) {
    return (isTrueFloat(borderData.x) && distToCenter > (1.0-size))
    || (isTrueFloat(borderData.y) && distToCornerA < size && distToCenter > (1.0-size))
    || (isTrueFloat(borderData.z) && distToCornerB < size && distToCenter > (1.0-size));
}


bool isBorder(vec3 cornerData, vec3 borderData, float size) {
    return isBorder(1.0-cornerData.x, 1.0-cornerData.y, 1.0-cornerData.z, borderData, size);
}



vec3 renderMapModeDefault() {

    // base terrain color
    vec3 color = applyFogOfWar(terrainColor(v_terrainData.x), v_terrainData.z);

    // overlay color
    if (v_layer_values_country.r > -0.1) {
        color = blend(color, vec4(v_layer_values_country.rgb, 0.5));
    }

    // borders
    if (v_layer_values_city.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_city, 0.05)) {
            color = v_layer_values_country.rgb;
        }
    }
    if (v_layer_values_country.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_country, 0.3)) {
            color = v_layer_values_country.rgb;
        }
    }

    return color;
}


vec3 renderMapModeCountries() {

    // base terrain color
    vec3 terrainColor = calcGrayscaleTerrainColor(v_terrainData.x);
    vec3 color = applyFogOfWar(terrainColor, v_terrainData.z);

    // overlay color
    if (v_layer_values_country.r > -0.1) {
        color = blend(color, vec4(v_layer_values_country.rgb, 0.5));
    }

    // borders
    if (v_layer_values_city.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_city, 0.05)) {
            color = v_layer_values_country.rgb;
        }
    }
    if (v_layer_values_country.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_country, 0.3)) {
            color = v_layer_values_country.rgb;
        }
    }

    return color;
}


vec3 renderMapModeCities() {

    // base terrain color
    vec3 terrainColor = calcGrayscaleTerrainColor(v_terrainData.x);
    vec3 color = applyFogOfWar(terrainColor, v_terrainData.z);

    // overlay color
    if (v_layer_values_city.r > -0.1) {
        color = blend(color, vec4(v_layer_values_city.rgb, 0.5));
    }

    // borders
    if (v_layer_values_city.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_city, 0.3)) {
            color = v_layer_values_city.rgb;
        }
    }
    if (v_layer_values_country.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_country, 0.1)) {
            color = v_layer_values_country.rgb;
        }
    }

    return color;
}


vec3 renderMapModeTerrain() {

    // base terrain color
    vec3 terrainColor = terrainColor(v_terrainData.x);
    vec3 color = applyFogOfWar(terrainColor, v_terrainData.z);

    // borders
    if (v_layer_values_country.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_country, 0.1)) {
            color = v_layer_values_country.rgb;
        }
    }

    return color;
}


vec3 renderMapModeResources() {

    // base terrain color
    vec3 terrainColor = blend(calcGrayscaleTerrainColor(v_terrainData.x), vec4(terrainColor(v_terrainData.x).rgb, 0.5));
    vec3 color = applyFogOfWar(terrainColor, v_terrainData.z);

    // resource color
    if (v_terrainData.y > -0.1) {
        color = calcResourceColor(v_terrainData.y);
    }

    // borders
    if (v_layer_values_city.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_city, 0.3)) {
            color = v_layer_values_city.rgb;
        }
    }
    if (v_layer_values_country.r > -0.5) {
        if (isBorder(v_cornerData, v_layer_borders_country, 0.1)) {
            color = v_layer_values_country.rgb;
        }
    }

    return color;
}


void main() {

    // base terrain color
    vec3 tileColor = renderMapModeDefault();
    if (u_mapMode == 1) {
        tileColor = renderMapModeCountries();
    }
    if (u_mapMode == 2) {
        tileColor = renderMapModeCities();
    }
    if (u_mapMode == 3) {
        tileColor = renderMapModeTerrain();
    }
    if (u_mapMode == 4) {
        tileColor = renderMapModeResources();
    }

    // highlight selected/mouseover
    if (isSelected(v_tilePosition)) {
        float selectedFade = pow(1.0 - v_cornerData.x, 2.0);
        tileColor = mix(tileColor, vec3(1.0, 1.0, 0.0), selectedFade);
    } else if (isMouseOver(v_tilePosition)) {
        float mouseOverFade = pow(1.0 - v_cornerData.x, 4.0);
        tileColor = mix(tileColor, vec3(0.7, 0.7, 0.0), mouseOverFade);
    }

    // return final color
    outColor = vec4(tileColor, 1.0);
}
