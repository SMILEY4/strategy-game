#version 300 es
precision mediump float;


uniform bool u_grayscaleMode;

/*
The texture for the entities
*/
uniform sampler2D u_tileset;

/*
The texture coordinates
*/
in vec2 v_textureCoordinates;

/*
Visibility id
*/
flat in int v_visibility;

/*
The final output color
*/
out vec4 outColor;


vec4 grayscale(vec4 color) {
    return vec4(vec3(color.r+color.g+color.b) / 3.0, color.a);
}

vec4 layerBaseColor() {
    return texture(u_tileset, v_textureCoordinates);
}

void main() {
    vec4 color = layerBaseColor();
    if (u_grayscaleMode) {
        color = grayscale(color);
    }
    outColor = color;
}
