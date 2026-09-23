#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform sampler2D u_colorTexture;
uniform sampler2D u_depthTexture;

out vec4 outColor;

float linearizeDepth(float depth, float near, float far) {
    return (near * far) / (far - depth * (far - near));
}

void main() {

    vec4 color = texture(u_colorTexture, v_textureCoordinates);
    float depth = linearizeDepth(texture(u_depthTexture, v_textureCoordinates).r, 0.1, 400.0);

//    outColor = vec4(vec3(depth), 1.0);
    outColor = vec4(color);

}