// Converts an RGB color (range [0.0, 1.0]) to HSL (range [0.0, 1.0])
vec3 rgb2hsl(vec3 c) {
    float maxVal = max(max(c.r, c.g), c.b);
    float minVal = min(min(c.r, c.g), c.b);
    float delta = maxVal - minVal;

    float h = 0.0;
    float s = 0.0;
    float l = (maxVal + minVal) * 0.5;

    if (delta > 0.00001) {
        s = l < 0.5 ? delta / (maxVal + minVal) : delta / (2.0 - maxVal - minVal);

        if (c.r == maxVal) {
            h = (c.g - c.b) / delta + (c.g < c.b ? 6.0 : 0.0);
        } else if (c.g == maxVal) {
            h = (c.b - c.r) / delta + 2.0;
        } else {
            h = (c.r - c.g) / delta + 4.0;
        }
        h /= 6.0;
    }

    return vec3(h, s, l);
}

// Helper function for hsl2rgb
float _hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0 / 2.0) return q;
    if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    return p;
}

// Converts an HSL color (range [0.0, 1.0]) to RGB (range [0.0, 1.0])
vec3 hsl2rgb(vec3 c) {
    vec3 rgb;

    if (c.y == 0.0) {
        // Achromatic (grey)
        rgb = vec3(c.z);
    } else {
        float q = c.z < 0.5 ? c.z * (1.0 + c.y) : c.z + c.y - c.z * c.y;
        float p = 2.0 * c.z - q;

        rgb.r = _hue2rgb(p, q, c.x + 1.0 / 3.0);
        rgb.g = _hue2rgb(p, q, c.x);
        rgb.b = _hue2rgb(p, q, c.x - 1.0 / 3.0);
    }

    return rgb;
}