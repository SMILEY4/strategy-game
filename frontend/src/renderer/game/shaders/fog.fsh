#version 300 es
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_textureCoordinates;
flat in int v_visibility;

out vec4 outColor;


void main() {
    vec4 texture = texture(u_texture, v_textureCoordinates);
    vec3 color = vec3(1.0);

    if(v_visibility == 0) { // visible
        color = vec3(1.0, 0.0, 0.0);
    }
    if(v_visibility == 1) { // discovered
        color = vec3(0.0, 1.0, 0.0);
    }
    if(v_visibility == 2) { // unknown
        color = vec3(0.0, 0.0, 1.0);
    }

    outColor = vec4(color, texture.a);
}
