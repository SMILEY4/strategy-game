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


vec3 calcTerrainColor(float terrainId) {
    if (terrainId < -0.5) { // -1 -> undiscovered
        return vec3(0.2);
    }
    if (terrainId < 0.5) { // 0 -> water
        return vec3(1.0/255.0, 96.0/255.0, 154.0/255.0);
    }
    if (terrainId < 1.5) { // 1 -> land
        return vec3(87.0/255.0, 139.0/255.0, 69.0/255.0);
    }
    if (terrainId < 2.5) { // 2 -> mountain
        return vec3(88.0/255.0, 99.0/255.0, 85.0/255.0);
    }
    return vec3(0.0);
}

vec3 calcGrayscaleTerrainColor(float terrainId) {
    vec3 terrainColor = calcTerrainColor(v_terrainData.x);
    return (vec3(terrainColor.r+terrainColor.g+terrainColor.b) / 3.0) * 1.75;
}


vec3 calcResourceColor(float resourceId) {
    if(resourceId < 0.5) { // forest
        return vec3(21.0 / 255.0, 112.0 / 255.0, 49.0 / 255.0);
    }
    if(resourceId < 1.5) { // fish
        return vec3(57.0 / 255.0, 96.0 / 255.0, 204.0 / 255.0);
    }
    if(resourceId < 2.5) { // stone
        return vec3(74.0 / 255.0, 74.0 / 255.0, 74.0 / 255.0);
    }
    if(resourceId < 3.5) { // metal
        return vec3(150.0 / 255.0, 150.0 / 255.0, 150.0 / 255.0);
    }
    return vec3(0.0);
}

vec3 applyFogOfWar(vec3 color, float visibilityId) {
    if (visibilityId < 0.5) { // 0 -> undiscovered
        return vec3(0.2);
    }
    if (visibilityId < 1.5) { // 1 -> discovered
        return mix(color, vec3(0.2), 0.5);
    }
    if (visibilityId < 2.5) { // 2 -> visible
        return color;
    }
    return vec3(0.2);
}


bool isMouseOver(vec2 tilePos) {
    return abs(u_tileMouseOver.x - tilePos.x) < 0.01 && abs(u_tileMouseOver.y - tilePos.y) < 0.01;
}


bool isSelected(vec2 tilePos) {
    return abs(u_tileSelected.x - tilePos.x) < 0.01 && abs(u_tileSelected.y - tilePos.y) < 0.01;
}


vec3 blend(vec3 background, vec4 foreground) {
    return vec3(
    background.r * (1.0 - foreground.a) + foreground.r * foreground.a,
    background.g * (1.0 - foreground.a) + foreground.g * foreground.a,
    background.b * (1.0 - foreground.a) + foreground.b * foreground.a
    );
}


bool isTrue(float value) {
    return 0.5 < value && value <  1.5;
}


bool isBorder(float distToCenter, float distToCornerA, float distToCornerB, vec3 borderData, float size) {
    return (isTrue(borderData.x) && distToCenter > (1.0-size))
    || (isTrue(borderData.y) && distToCornerA < size && distToCenter > (1.0-size))
    || (isTrue(borderData.z) && distToCornerB < size && distToCenter > (1.0-size));
}


bool isBorder(vec3 cornerData, vec3 borderData, float size) {
    return isBorder(1.0-cornerData.x, 1.0-cornerData.y, 1.0-cornerData.z, borderData, size);
}



vec3 renderMapModeDefault() {

    // base terrain color
    vec3 color = applyFogOfWar(calcTerrainColor(v_terrainData.x), v_terrainData.z);

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
    vec3 terrainColor = calcTerrainColor(v_terrainData.x);
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
    vec3 terrainColor = blend(calcGrayscaleTerrainColor(v_terrainData.x), vec4(calcTerrainColor(v_terrainData.x).rgb, 0.5));
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
