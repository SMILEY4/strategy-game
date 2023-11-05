#version 300 es
precision mediump float;

uniform sampler2D u_tileset;
uniform sampler2D u_texture;
uniform sampler2D u_noise;

in vec2 v_textureCoordinates;
in vec2 v_worldPosition;

flat in int v_tilesetIndex;
flat in int v_visibility;

out vec4 outColor;


vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 blendBurn(vec3 a, vec3 b) {
    return vec3(1.0) - (vec3(1.0) - a) / b;
}

vec2 tilesetTextureCoords() {
    float totalTiles = 4.0;
    float totalWidth = 2274.0;
    float gapSize = 10.0;
    float gapSizePerc = gapSize / totalWidth;



    float offset = float(v_tilesetIndex) / totalTiles;
    float u = (v_textureCoordinates.x / totalTiles) + offset + (gapSizePerc * float(v_tilesetIndex + 1));
    float v = v_textureCoordinates.y;
    return vec2(u, v);
}

float basePaperTexture() {

    float scalePaper = 90.0; // bigger number = larger texture
    float impactPaper = 1.0;

    float scaleClouds = 200.0;
    float impactClouds = 0.4;

    float paper = mix(1.0, texture(u_texture, v_worldPosition / scalePaper).x, impactPaper);
    float clouds = mix(1.0, texture(u_noise, v_worldPosition / scaleClouds).x, impactClouds);

    return paper * clouds;
}

vec4 paperColor(float basePaperTexture) {
    // combine paper + noise
    vec3 color = vec3(basePaperTexture);

    // define tint color (in hsv)
    vec3 tintColor = rgb2hsv(vec3(0.75, 0.64, 0.5));

    // convert color to hsv
    vec3 colorHSV = rgb2hsv(color);

    // merge with tint
    vec3 blendedColorHSV = vec3(tintColor.x, tintColor.y, colorHSV.z);

    // convert back to rgb
    vec3 blendedColorRGB = hsv2rgb(blendedColorHSV);
    return vec4(blendedColorRGB, 1.0);
}

vec4 tileColor(float basePaperTexture) {
    vec2 texCoords = tilesetTextureCoords();
    vec4 color = texture(u_tileset, texCoords);
    return vec4(color.rgb * basePaperTexture, color.a);
}

vec3 applyFogOfWar(vec3 baseColor) {
    if (v_visibility == 0) { // unknown
        return vec3(baseColor.rgb * 0.2);
    }
    if (v_visibility == 1) { // discovered
        return vec3(baseColor.rgb * 0.5);
    }
    if (v_visibility == 2) { // visible
        return vec3(baseColor.rgb);
    }
    return baseColor;
}


void main() {

    float paperTexture = basePaperTexture();

    vec4 colorPaper = paperColor(paperTexture);
    vec4 colorTile = tileColor(paperTexture);

    outColor = colorTile;


    vec3 color = mix(colorPaper, colorTile, colorTile.a).rgb;

    color = applyFogOfWar(color);

    outColor = vec4(color.rgb, 1.0);
}
