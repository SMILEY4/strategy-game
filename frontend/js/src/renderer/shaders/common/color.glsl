/*
 * Adjusts the saturation of a color.
 *
 * @param rgb: The color.
 * @param adjustment: The amount to adjust the saturation of the color.
 *
 * @returns The color with the saturation adjusted.
 *
 * @example
 * vec3 greyScale = czm_saturation(color, 0.0);
 * vec3 doubleSaturation = czm_saturation(color, 2.0);
 *
 * Source: https://github.com/minus34/cesium1/blob/master/Cesium/Shaders/Builtin/Functions/saturation.glsl
*/
vec3 clr_saturation(vec3 rgb, float adjustment)
{
    // Algorithm from Chapter 16 of OpenGL Shading Language
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
}

/*
 * Reverse premultiplied alpha
*/
vec4 clr_reversePremultAlpha(vec4 color) {
    return vec4(color.a > 0.0 ? color.rgb / color.a : vec3(0.0), color.a);
}

/*
 * Blends the two colors "a over b".
*/
vec4 clr_blend(vec4 a, vec4 b) {
    // https://en.wikipedia.org/wiki/Alpha_compositing
    float alpha = a.a + b.a * (1.0 - a.a);
    return vec4(
        (a.r*a.a + b.r*b.a*(1.0-a.a)) / alpha,
        (a.g*a.a + b.g*b.a*(1.0-a.a)) / alpha,
        (a.b*a.a + b.b*b.a*(1.0-a.a)) / alpha,
        alpha
    );
}

/*
 * Convert from rgb to hsv. All values are in range 0 to 1.
 * Source: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
*/
vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

/*
 * Convert from hsv to rgb. All values are in range 0 to 1.
 * Source: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
*/
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
