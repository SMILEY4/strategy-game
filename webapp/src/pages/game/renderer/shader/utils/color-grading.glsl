const vec3  _CC_LUMA_709   = vec3(0.2126, 0.7152, 0.0722);
const float _CC_MID_GREY   = 0.18;
const float _CC_EPS        = 1e-5;
const float _CC_HALF_MAX   = 65504.0;

float _luma(vec3 c) { return dot(c, _CC_LUMA_709); }

// ---------------------------------------------------------------------------
// Exposure: stops (EV). +1.0 doubles brightness.
// ---------------------------------------------------------------------------
vec3 gradeExposure(vec3 c, float ev) {
    return c * exp2(ev);
}

// ---------------------------------------------------------------------------
// White balance: temperature (-1 cool/blue .. +1 warm/orange),
//                tint        (-1 green .. +1 magenta).
// Multipliers are normalised so overall luminance is preserved.
// ---------------------------------------------------------------------------
vec3 gradeWhiteBalance(vec3 c, float temperature, float tint) {
    vec3 m = vec3(1.0 + 0.3 * temperature,
            1.0 - 0.3 * tint,
            1.0 - 0.3 * temperature);
    m /= _luma(m);
    return c * m;
}

// ---------------------------------------------------------------------------
// Brightness: simple linear-space offset. Range ~ -1..1 (scaled to mid-grey).
// Lifts everything including blacks; use exposure for a "cleaner" change.
// ---------------------------------------------------------------------------
vec3 gradeBrightness(vec3 c, float brightness) {
    return c + brightness * _CC_MID_GREY;
}

// ---------------------------------------------------------------------------
// Contrast: power curve pivoted at scene mid-grey (0.18), HDR safe.
// contrast = 0 -> unchanged, +1 -> 2x slope, -1 -> flat (0.5x slope... floor 0)
// ---------------------------------------------------------------------------
vec3 gradeContrast(vec3 c, float contrast) {
    float k = exp2(contrast);                       // 0.5 .. 2.0 for -1..1
    return _CC_MID_GREY * pow(max(c, vec3(0.0)) / _CC_MID_GREY, vec3(k));
}

// ---------------------------------------------------------------------------
// Blacks / Whites (levels):
//   blacks: +lifts / -crushes the black point
//   whites: +brightens / -darkens the white point (in stops)
// ---------------------------------------------------------------------------
vec3 gradeBlacksWhites(vec3 c, float blacks, float whites) {
    float blackPoint = -blacks * 0.03;              // negative = lifted blacks
    float whitePoint = exp2(-whites);               // <1 = brighter highlights
    return (c - blackPoint) / max(whitePoint - blackPoint, _CC_EPS);
}

// ---------------------------------------------------------------------------
// Shadows / Highlights: luminance-masked exposure change.
// Masks are computed in stops relative to mid-grey so they behave consistently
// in HDR. Positive shadows = open up, negative highlights = recover.
// ---------------------------------------------------------------------------
vec3 gradeShadowsHighlights(vec3 c, float shadows, float highlights) {
    float y     = max(_luma(c), _CC_EPS);
    float stops = log2(y / _CC_MID_GREY);               // 0 at mid-grey

    float shadowMask    = 1.0 - smoothstep(-5.0, 0.0, stops);
    float highlightMask = smoothstep(-1.0, 3.0, stops);

    float ev = 1.5 * (shadows * shadowMask + highlights * highlightMask);
    return c * exp2(ev);
}

// ---------------------------------------------------------------------------
// Saturation: 0 = unchanged, -1 = greyscale, +1 = double.
// ---------------------------------------------------------------------------
vec3 gradeSaturation(vec3 c, float saturation) {
    float y = _luma(c);
    return mix(vec3(y), c, 1.0 + saturation);
}

// ---------------------------------------------------------------------------
// Vibrance: saturation that mostly affects LOW-saturation pixels, leaving
// already-vivid colours alone. Optional skin-tone protection.
// ---------------------------------------------------------------------------
vec3 gradeVibrance(vec3 c, float vibrance, float protectSkin) {
    float mx   = max(c.r, max(c.g, c.b));
    float mn   = min(c.r, min(c.g, c.b));
    float sat  = (mx - mn) / max(mx, _CC_EPS);          // 0..1 chroma estimate

    // Skin tones sit around orange: R > G > B with moderate saturation.
    float skin = step(c.g, c.r) * step(c.b, c.g);
    skin *= smoothstep(0.1, 0.35, sat) * (1.0 - smoothstep(0.35, 0.7, sat));

    float weight = (1.0 - sat) * (1.0 - protectSkin * 0.6 * skin);
    float y = _luma(c);
    return mix(vec3(y), c, 1.0 + vibrance * weight);
}

// ---------------------------------------------------------------------------
// Optional extras
// ---------------------------------------------------------------------------

// Gamma-style midtone adjustment (>1 brightens mids, keeps 0 and 1 anchored
// in the 0..1 range; HDR values above 1 scale smoothly).
vec3 gradeGamma(vec3 c, float gamma) {
    return pow(max(c, vec3(0.0)), vec3(1.0 / max(gamma, _CC_EPS)));
}

// Split toning: tint shadows and highlights with colours (pass linear RGB).
vec3 gradeSplitTone(vec3 c, vec3 shadowTint, vec3 highlightTint, float amount) {
    float y     = max(_luma(c), _CC_EPS);
    float stops = log2(y / _CC_MID_GREY);
    float sm = 1.0 - smoothstep(-4.0, 1.0, stops);
    float hm = smoothstep(-1.0, 3.0, stops);
    vec3 tint = mix(vec3(1.0), shadowTint, sm * amount)
    * mix(vec3(1.0), highlightTint, hm * amount);
    return c * tint;
}

// Simple vignette in UV space. strength 0..1, softness ~0.2..1.
vec3 gradeVignette(vec3 c, vec2 uv, float strength, float softness) {
    float d = length((uv - 0.5) * vec2(1.0, 1.0)) * 1.4142;
    float v = smoothstep(1.0, 1.0 - softness, d);
    return c * mix(1.0 - strength, 1.0, v);
}

// ---------------------------------------------------------------------------
// Combined grade
// ---------------------------------------------------------------------------
struct Grade {
    float exposure;        // EV stops
    float temperature;     // -1..1
    float tint;            // -1..1
    float brightness;      // -1..1
    float contrast;        // -1..1
    float blacks;          // -1..1
    float whites;          // -1..1
    float shadows;         // -1..1
    float highlights;      // -1..1
    float vibrance;        // -1..1
    float saturation;      // -1..1
};

vec3 applyGrade16F(vec3 c, Grade g) {
    c = max(c, vec3(0.0));

    c = gradeExposure(c, g.exposure);
    c = gradeWhiteBalance(c, g.temperature, g.tint);
    c = gradeBrightness(c, g.brightness);
    c = gradeBlacksWhites(c, g.blacks, g.whites);
    c = gradeShadowsHighlights(c, g.shadows, g.highlights);
    c = gradeContrast(c, g.contrast);
    c = gradeVibrance(c, g.vibrance, 1.0);
    c = gradeSaturation(c, g.saturation);

    // Keep the result representable in RGBA16F and non-negative.
    return clamp(c, vec3(0.0), vec3(_CC_HALF_MAX));
}
