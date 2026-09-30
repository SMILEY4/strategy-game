#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_worldColor;
uniform float u_exposure;
uniform float u_temperature;
uniform float u_tint;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_blacks;
uniform float u_whites;
uniform float u_shadows;
uniform float u_highlights;
uniform float u_vibrance;
uniform float u_saturation;

out vec4 outColor;

#include "../utils/color-grading.glsl"

void main() {
    vec4 color = texture(u_worldColor, v_textureCoordinates);

    Grade grade;
    grade.exposure = u_exposure;
    grade.temperature = u_temperature;
    grade.tint = u_tint;
    grade.brightness = u_brightness;
    grade.contrast = u_contrast;
    grade.blacks = u_blacks;
    grade.whites = u_whites;
    grade.shadows = u_shadows;
    grade.highlights = u_highlights;
    grade.vibrance = u_vibrance;
    grade.saturation = u_saturation;
    outColor = vec4(applyGrade16F(color.rgb, grade), color.a);

//    float colorGrayscale = (color.r + color.g + color.b) / 3.0;
//    outColor = vec4(colorGrayscale, colorGrayscale, colorGrayscale, color.a);
}
