#version 300 es
precision mediump float;

uniform sampler2D u_water;
uniform sampler2D u_land;
uniform sampler2D u_fog;
uniform sampler2D u_entities;
uniform sampler2D u_details;
uniform sampler2D u_routes;
uniform sampler2D u_overlay;

uniform sampler2D u_parchment;
uniform sampler2D u_paper;
uniform sampler2D u_noise;
uniform sampler2D u_paperLarge;

uniform mat3 u_invViewProjection;

in vec2 v_textureCoordinates;

out vec4 outColor;

// reverse pre-multiplied alpha
vec4 framebuffer(sampler2D fb, vec2 coords) {
    vec4 color = texture(fb, coords);
    return vec4(color.a > 0.0 ? color.rgb / color.a : vec3(0.0), color.a);
}


vec2 getMapPosition(mat3 invViewProjection, vec2 screen) {
    return (invViewProjection * vec3(screen * 2.0 - 1.0, 1.0)).xy;
}

vec4 convertFog(vec4 fogIn) {
    vec4 colorUnknown = vec4(0.15, 0.15, 0.15, 1.0);
    vec4 colorDiscovered = vec4(0.15, 0.15, 0.15, 0.6);
    vec4 color = mix(colorUnknown, colorDiscovered, fogIn.g);
    color.a = color.a * fogIn.a;
    return color;
}

vec4 processLand(vec4 landIn) {
    float outlinePosition = 0.5;
    return vec4(landIn.rgb, landIn.a >= outlinePosition ? 1.0 : 0.0);
}

vec4 processWater(vec4 waterIn) {

    vec2 mapPosition = getMapPosition(u_invViewProjection, v_textureCoordinates);
    float waveDistortion = 0.225;
    float depth = clamp(waterIn.g / 0.8, 0.0, 1.0);
    float noise = texture(u_noise, mapPosition*vec2(0.05)).r  * waveDistortion + (1.0-waveDistortion);;
    float waves = sin(depth*40.0*noise) * pow(depth, 1.5);
    waves = smoothstep(0.0, 0.4, waves);

    vec3 colorLight = vec3(0.647, 0.753, 0.773);
    vec3 colorDark = vec3(0.475, 0.584, 0.682);
    vec3 color = mix(colorLight, colorDark, waterIn.r);

    return vec4(color + waves, waterIn.a);
}


vec3 getPaperTexture() {
    vec2 mapPosition = getMapPosition(u_invViewProjection, v_textureCoordinates);

    float parchmentStrengh = 0.25;
    float paperStrength = 0.2;
    float paperLargeStrength = 0.3;
    float noiseStrength = 0.2;

    float parchment = texture(u_parchment, mapPosition*vec2(0.002)).r * parchmentStrengh + (1.0-parchmentStrengh);
    float paper = texture(u_paper, mapPosition*vec2(0.005)).r * paperStrength + (1.0-paperStrength);
    float noise = texture(u_noise, mapPosition*vec2(0.003)).r * noiseStrength + (1.0-noiseStrength);
    float paperLarge = texture(u_paperLarge, mapPosition*vec2(0.002)).r * paperLargeStrength + (1.0-paperLargeStrength);

    return vec3(pow(parchment, 2.0) * pow(paper, 2.0) * noise * paperLarge);
}

vec3 czm_saturation(vec3 rgb, float adjustment)
{
    // Algorithm from Chapter 16 of OpenGL Shading Language
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
}

float isLand(vec2 pos) {
    return processLand(framebuffer(u_land, pos)).a;
}

float isOutlineLand(float size) {

    float outline = 0.0;

    outline += isLand(v_textureCoordinates + vec2(-size, 0));
    outline += isLand(v_textureCoordinates + vec2(0, size));
    outline += isLand(v_textureCoordinates + vec2(size, 0));
    outline += isLand(v_textureCoordinates + vec2(0, -size));
    outline += isLand(v_textureCoordinates + vec2(-size, size));
    outline += isLand(v_textureCoordinates + vec2(size, size));
    outline += isLand(v_textureCoordinates + vec2(-size, -size));
    outline += isLand(v_textureCoordinates + vec2(size, -size));
    outline = min(outline, 1.0);

    return step(0.5, outline) - isLand(v_textureCoordinates);
}

vec4 getOutlineLand() {
    vec4 inner = mix(vec4(0.0), vec4(vec3(2.0), 1.0), isOutlineLand(0.003));
    vec4 outer = mix(vec4(0.0), vec4(vec3(0.0), 1.0), isOutlineLand(0.002));
    vec4 color = vec4(0.0);
    color = mix(color, inner, inner.a);
    color = mix(color, outer, outer.a);
    return color;
}


void main() {
    vec4 water = processWater(framebuffer(u_water, v_textureCoordinates));
    vec4 land = processLand(framebuffer(u_land, v_textureCoordinates));
    vec4 fog = convertFog(framebuffer(u_fog, v_textureCoordinates));
    vec4 entities = framebuffer(u_entities, v_textureCoordinates);
    vec4 details = framebuffer(u_details, v_textureCoordinates);
    vec4 routes = framebuffer(u_routes, v_textureCoordinates);
    vec4 overlay = framebuffer(u_overlay, v_textureCoordinates);
    vec4 landOutline = getOutlineLand();

    // combine layers
    vec4 color = vec4(0.0);
    color = mix(color, water, water.a);
    color = mix(color, land, land.a);
    color = mix(color, landOutline, landOutline.a);
    color = mix(color, details, details.a);
    color = mix(color, overlay, overlay.a);
    color = mix(color, routes, routes.a);
    color = mix(color, entities, entities.a);
    color = mix(color, fog, fog.a);

//     apply paper effect
    vec3 paper = getPaperTexture();
    color = vec4(color.rgb * paper, color.a);

    // color correct
    color = vec4(pow(color.r, 0.75), pow(color.g, 0.75), pow(color.b, 0.75), color.a);
    color.rgb = czm_saturation(color.rgb, 1.2);

    outColor = color;
}