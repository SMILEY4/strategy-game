#version 300 es
precision mediump float;

flat in vec2 v_tilePosition;
in vec2 v_textureCoordinates;

uniform sampler2D u_baseTerrain;

out vec4 outColor;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {

    // tile position color
    float r = max(0.5, hash(v_tilePosition + vec2(0.0, 0.0)));
    float g = max(0.5, hash(v_tilePosition + vec2(1.0, 2.0)));
    float b = max(0.5, hash(v_tilePosition + vec2(3.0, 4.0)));

    // shape mask
    vec4 texture = texture(u_baseTerrain, v_textureCoordinates);

    // final color
//    outColor = vec4(vec3(r, g, b), texture.a);
    outColor = vec4(vec3(112.0/255.0, 112.0/255.0, 86.0/255.0), texture.a);

}