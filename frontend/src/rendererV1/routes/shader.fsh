#version 300 es
precision mediump float;


/*
The texture
*/
uniform sampler2D u_texture;

/*
The texture coordinates
*/
in vec2 v_textureCoordinates;

/*
The final output color
*/
out vec4 outColor;


void main() {
    vec4 color = texture(u_texture, v_textureCoordinates);
    outColor = vec4(vec3(1.0), color.a);
}
