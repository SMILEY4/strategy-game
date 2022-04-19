#version 300 es
precision mediump float;

flat in float v_tiledata;

out vec4 outColor;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    float tileId = v_tiledata;
    vec3 finalColor = hsv2rgb(vec3((tileId)/5.0, 0.5, 1.4));
    outColor = vec4(finalColor, 1.0);
}
