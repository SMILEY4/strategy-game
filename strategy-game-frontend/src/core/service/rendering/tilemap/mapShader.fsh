#version 300 es
precision mediump float;

uniform vec2 u_tileMouseOver;
uniform vec2 u_tileSelected;

flat in vec2 v_tilePosition;
in vec3 v_cornerData;
flat in vec2 v_terrainData;

flat in vec3 v_layer_values_country;
flat in vec3 v_layer_values_province;
flat in vec3 v_layer_values_city;

flat in vec3 v_layer_borders_country;
flat in vec3 v_layer_borders_province;
flat in vec3 v_layer_borders_city;

out vec4 outColor;


vec3 calcTerrainColor(float terrainId) {
    if (terrainId < -0.5) { // -1 -> undiscovered
        return vec3(0.2);
    }
    if (terrainId < 0.5) { // 0 -> water
        return vec3(0.3, 0.3, 1.0);
    }
    if (terrainId > 0.5) { // 1 -> land
        return vec3(0.3, 1.0, 0.3);
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


void main() {

    // base terrain color
    vec3 tileColor = applyFogOfWar(calcTerrainColor(v_terrainData.x), v_terrainData.y);

    // overlay color
    if (v_layer_values_country.r > -0.1) {
        tileColor = blend(tileColor, vec4(v_layer_values_country.r, v_layer_values_country.g, v_layer_values_country.b, 0.5));
    }

    // borders
    if (v_layer_values_city.r > -0.5) {
        if (isBorder(1.0-v_cornerData.x, 1.0-v_cornerData.y, 1.0-v_cornerData.z, v_layer_borders_city, 0.05)) {
            tileColor = mix(vec3(0.0), v_layer_values_country.rgb, 0.5);
        }
    }
    if (v_layer_values_province.r > -0.5) {
        if (isBorder(1.0-v_cornerData.x, 1.0-v_cornerData.y, 1.0-v_cornerData.z, v_layer_borders_province, 0.1)) {
            tileColor = mix(vec3(0.0), v_layer_values_country.rgb, 0.5);
        }
    }
    if (v_layer_values_country.r > -0.5) {
        if (isBorder(1.0-v_cornerData.x, 1.0-v_cornerData.y, 1.0-v_cornerData.z, v_layer_borders_country, 0.3)) {
            tileColor = v_layer_values_country.rgb;
        }
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
