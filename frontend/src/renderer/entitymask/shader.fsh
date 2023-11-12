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
The final output color
*/
out vec4 outColor;


void main() {
    outColor = texture(u_tileset, v_textureCoordinates);
}
