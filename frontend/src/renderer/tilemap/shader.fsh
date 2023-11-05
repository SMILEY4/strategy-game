#version 300 es
precision mediump float;

uniform sampler2D u_tileset;
uniform sampler2D u_texture;
uniform sampler2D u_noise;
uniform float u_zoom;

in vec2 v_textureCoordinates;
in vec2 v_worldPosition;

in vec3 v_cornerData;

flat in int v_tilesetIndex;
flat in int v_visibility;

flat in int v_edgeDirection;
flat in int v_borderMask;

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

bool checkBit(int value, int digit) {
    int mask = 0;
    if (digit == 1) { mask = 1; }
    else if (digit == 2) { mask = 2; }
    else if (digit == 3) { mask = 4; }
    else if (digit == 4) { mask = 8; }
    else if (digit == 5) { mask = 16; }
    else if (digit == 6) { mask = 32; }
    return (value & mask) > 0;
}

vec3 blendBurn(vec3 a, vec3 b) {
    return vec3(1.0) - (vec3(1.0) - a) / b;
}

vec2 tilesetTextureCoords() {
    float totalTiles = 4.0;
    float slotSize = 600.0;
    float gapSize = 10.0;
    float totalWidth = gapSize + (slotSize + gapSize) * totalTiles;

    float texCoordPx = v_textureCoordinates.x * slotSize;
    float offsetPx = gapSize + (float(v_tilesetIndex) * (slotSize + gapSize));
    float uPx = texCoordPx + offsetPx;
    float u = uPx / totalWidth;

    float v = v_textureCoordinates.y;

    return vec2(u, v);
}

float basePaperTexture(float basePaper, float baseClouds) {
    float impactPaper = 1.0;
    float impactClouds = 0.5;

    float paper = mix(1.0, basePaper, impactPaper);
    float clouds = mix(1.0, baseClouds, impactClouds);

    return paper * clouds;
}

vec4 paperColor(float baseClouds, float paperTexture) {
    // combine paper + noise
    vec3 color = vec3(paperTexture);

    // define tint color (in hsv)
    vec3 tintColor0 = rgb2hsv(vec3(0.88, 0.73, 0.62));
    vec3 tintColor1 = rgb2hsv(vec3(0.99, 0.75, 0.58));
    vec3 tintColor = mix(tintColor0, tintColor1, 1.0-baseClouds);

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

vec4 baseTileBorder() {
    if (u_zoom < 3.5) {
        return vec4(0.0);
    } else {
        float minThickness = 0.015;
        float thickness = smoothstep(3.5, 10.0, u_zoom) * (0.03 - minThickness) + minThickness;
        float value = step(v_cornerData.x, thickness);
        return vec4(vec3(0.0), value);
    }
}

vec4 primaryBorder()  {
    bool hasBorder = checkBit(v_borderMask, v_edgeDirection+1);
    if(hasBorder) {
        float thickness = 0.1;
        float value = step(v_cornerData.x, thickness);
        return vec4(1.0, 0.0, 0.0, value);
    } else {
        return vec4(0.0);
    }
}


void main() {

    float scalePaper = 90.0;
    float basePaper = texture(u_texture, v_worldPosition / scalePaper).x;

    float scaleClouds = 200.0;
    float baseClouds = texture(u_noise, v_worldPosition / scaleClouds).x;

    float paperTexture = basePaperTexture(basePaper, baseClouds);

    vec4 colorPaper = paperColor(baseClouds, paperTexture);
    vec4 colorTile = tileColor(paperTexture);

    vec4 colorBaseTileBorder = baseTileBorder();
    vec4 colorPrimaryBorder = primaryBorder();

    vec3 color = mix(colorPaper, colorTile, colorTile.a).rgb;
    color = applyFogOfWar(color);
    color = mix(color, colorPrimaryBorder.rgb, colorPrimaryBorder.a);
    color = mix(color, colorBaseTileBorder.rgb, colorBaseTileBorder.a);

    outColor = vec4(color.rgb, 1.0);
}
