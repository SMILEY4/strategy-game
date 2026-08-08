#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_layerBaseTerrain;
uniform sampler2D u_layerCoastlineMask;
uniform sampler2D u_layerFogOfWar;
uniform sampler2D u_layerMapDetails;

uniform float u_dbg_terrainCutoff;

out vec4 outColor;

void main() {

    float TERRAIN_CUTOFF = u_dbg_terrainCutoff;

    float OUTLINE_POSITION = u_dbg_terrainCutoff;
    float OUTLINE_THICKNESS = 0.15;

    float WAVE_THICKNESS = 0.1;
    float WAVE_0_POSITION = u_dbg_terrainCutoff - OUTLINE_THICKNESS - 0.25;
    float WAVE_1_POSITION = WAVE_0_POSITION - WAVE_THICKNESS - 0.25;

    // sample layers
    vec4 layerBaseTerrain = texture(u_layerBaseTerrain, v_textureCoordinates);
    vec4 layerCoastlineMask = texture(u_layerCoastlineMask, v_textureCoordinates);
    vec4 layerFogOfWar = texture(u_layerFogOfWar, v_textureCoordinates);
    vec4 layerMapDetails = texture(u_layerMapDetails, v_textureCoordinates);

    // terrain mask
    float terrainMask = step(TERRAIN_CUTOFF, layerCoastlineMask.a);

    // terrain outline
    float terrainOutline = step(OUTLINE_POSITION-OUTLINE_THICKNESS*0.5, layerCoastlineMask.a) - step(OUTLINE_POSITION+OUTLINE_THICKNESS*0.5, layerCoastlineMask.a);

    // waves
    float wave0 = step(WAVE_0_POSITION-WAVE_THICKNESS*0.5, layerCoastlineMask.a) - step(WAVE_0_POSITION+WAVE_THICKNESS*0.5, layerCoastlineMask.a);
    float wave1 = step(WAVE_1_POSITION-WAVE_THICKNESS*0.5, layerCoastlineMask.a) - step(WAVE_1_POSITION+WAVE_THICKNESS*0.5, layerCoastlineMask.a);
    float waves = wave0 + wave1;

    // final terrain
    vec4 colorTerrain = vec4(layerBaseTerrain.rgb, layerBaseTerrain.a * terrainMask);
    colorTerrain = mix(colorTerrain, vec4(vec3(0.0), 1.0), terrainOutline);
    colorTerrain = mix(colorTerrain, vec4(vec3(1.0), 1.0), waves);

    vec3 finalColor = vec3(159.0 / 255.0, 183.0 / 255.0, 187.0 / 255.0);
    finalColor = mix(finalColor, colorTerrain.rgb, colorTerrain.a);

    // map details
    finalColor = mix(finalColor, layerMapDetails.rgb, layerMapDetails.a);

    // fog of war
    float maskUndiscovered = 1.0 - clamp(layerFogOfWar.r - (layerFogOfWar.g + layerFogOfWar.b), 0.0, 1.0);
    finalColor = finalColor * maskUndiscovered;

    // final color
    outColor = vec4(finalColor, 1.0);
}