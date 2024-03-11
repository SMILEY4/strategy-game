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