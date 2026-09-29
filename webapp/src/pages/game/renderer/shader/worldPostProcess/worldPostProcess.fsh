#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_worldColor;

out vec4 outColor;

void main() {
    vec4 color = texture(u_worldColor, v_textureCoordinates);

    outColor = color;

//    float colorGrayscale = (color.r + color.g + color.b) / 3.0;
//    outColor = vec4(colorGrayscale, colorGrayscale, colorGrayscale, color.a);
}