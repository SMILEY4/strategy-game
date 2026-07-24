#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_layerBaseTerrain;
uniform sampler2D u_layerCoastlineMask;

float TERRAIN_CUTOFF = 0.8;

float OUTLINE_POSITION = 0.8;
float OUTLINE_THICKNESS = 0.15;

float WAVE_0_POSITION = 0.5;
float WAVE_1_POSITION = 0.15;
float WAVE_THICKNESS = 0.1;



out vec4 outColor;

void main() {

    vec4 layerBaseTerrain = texture(u_layerBaseTerrain, v_textureCoordinates);
    vec4 layerCoastlineMask = texture(u_layerCoastlineMask, v_textureCoordinates);

    // terrain mask
    float terrainMask = step(TERRAIN_CUTOFF, layerCoastlineMask.a);

    // terrain outline
    float terrainOutline = step(OUTLINE_POSITION-OUTLINE_THICKNESS*0.5, layerCoastlineMask.a) - step(OUTLINE_POSITION+OUTLINE_THICKNESS*0.5, layerCoastlineMask.a);

    // waves
    float wave0 = step(WAVE_0_POSITION-WAVE_THICKNESS*0.5, layerCoastlineMask.a) - step(WAVE_0_POSITION+WAVE_THICKNESS*0.5, layerCoastlineMask.a);
    float wave1 = step(WAVE_1_POSITION-WAVE_THICKNESS*0.5, layerCoastlineMask.a) - step(WAVE_1_POSITION+WAVE_THICKNESS*0.5, layerCoastlineMask.a);
    float waves = wave0 + wave1;

    vec4 colorTerrain = vec4(layerBaseTerrain.rgb, layerBaseTerrain.a * terrainMask);
    colorTerrain = mix(colorTerrain, vec4(vec3(0.0), 1.0), terrainOutline);
    colorTerrain = mix(colorTerrain, vec4(vec3(1.0), 1.0), waves);

    outColor = colorTerrain;

}