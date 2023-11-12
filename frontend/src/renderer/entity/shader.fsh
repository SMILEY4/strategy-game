#version 300 es
precision mediump float;


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


vec4 layerBaseColor() {
    return texture(u_tileset, v_textureCoordinates);
}

void main() {
    // result
    outColor = layerBaseColor();
}
