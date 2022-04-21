#version 300 es
precision mediump float;

flat in float v_markerdata;

out vec4 outColor;


vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 calcMarkerColor() {
    float markerId = v_markerdata;
    if(markerId < 0.0) {
        return vec3(0.0);
    } else {
        return hsv2rgb(vec3((markerId)/5.0, 1.0, 1.0));
    }
}

void main() {
    vec3 markerColor = calcMarkerColor();
    outColor = vec4(markerColor, 1.0);
}
