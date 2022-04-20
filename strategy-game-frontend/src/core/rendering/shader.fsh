#version 300 es
precision mediump float;

uniform vec2 u_tileMouseOver;

flat in vec3 v_tiledata;

out vec4 outColor;


vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 calcTileColor() {
    float tileId = v_tiledata.z;
    return hsv2rgb(vec3((tileId)/5.0, 0.5, 1.0));
}

bool isMouseOver() {
    vec2 qr = v_tiledata.xy;
    return abs(u_tileMouseOver.x - qr.x) < 0.01 && abs(u_tileMouseOver.y - qr.y) < 0.01;
}

void main() {
    vec3 tileColor = calcTileColor();
    if (isMouseOver()) {
        tileColor = tileColor * 0.5;
    }
    outColor = vec4(tileColor, 1.0);
}
