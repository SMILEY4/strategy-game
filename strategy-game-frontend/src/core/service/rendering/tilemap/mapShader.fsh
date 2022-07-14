#version 300 es
precision mediump float;

uniform vec2 u_tileMouseOver;
uniform vec2 u_tileSelected;

flat in vec3 v_tiledata;

out vec4 outColor;


vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 calcTileColor() {
    float tileId = v_tiledata.z;
    if(tileId < 0.5) { // 0 -> water
        return vec3(0.0, 0.0, 1.0);
    }
    if(tileId > 0.5) { // 1 -> land
        return vec3(0.0, 1.0, 0.0);
    }
    return vec3(0.0);
}

bool isMouseOver() {
    vec2 qr = v_tiledata.xy;
    return abs(u_tileMouseOver.x - qr.x) < 0.01 && abs(u_tileMouseOver.y - qr.y) < 0.01;
}

bool isSelected() {
    vec2 qr = v_tiledata.xy;
    return abs(u_tileSelected.x - qr.x) < 0.01 && abs(u_tileSelected.y - qr.y) < 0.01;
}

void main() {
    vec3 tileColor = calcTileColor();
    if (isSelected()) {
        tileColor = tileColor * 0.5;
    } else if (isMouseOver()) {
        tileColor = tileColor * 0.75;
    }
    outColor = vec4(tileColor, 1.0);
}
