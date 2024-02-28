#version 300 es
precision mediump float;

uniform sampler2D u_water;
uniform sampler2D u_land;
uniform sampler2D u_fog;

in vec2 v_textureCoordinates;

out vec4 outColor;

vec4 framebuffer(sampler2D fb, vec2 coords) {
    // reverse pre-multiplied alpha
    vec4 color = texture(fb, coords);
    return vec4(color.a > 0.0 ? color.rgb / color.a : vec3(0.0), color.a);
}

void main() {
    vec4 water = framebuffer(u_water, v_textureCoordinates);
    vec4 land = framebuffer(u_land, v_textureCoordinates);
    vec4 fog = framebuffer(u_fog, v_textureCoordinates);

    vec4 color = vec4(0.0);
    color = mix(color, water, water.a);
    color = mix(color, land, land.a);
    color = mix(color, fog, fog.a);

    outColor = color;
}