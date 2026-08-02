#version 300 es
precision mediump float;

in vec2 v_textureCoordinates;

uniform float u_radius;   // Circle radius (0.0 to 1.0, typical full circle is ~1.0)
uniform float u_thickness; // Thickness of the ring wall (e.g., 0.2)
uniform float u_softness; // Edge blur size (e.g., 0.05 for slight blur, 0.5 for very soft)
uniform vec4 u_color;     // Circle color RGBA

out vec4 outColor;

void main() {
    // Remap UV coordinates from [0.0, 1.0] to [-1.0, 1.0]
    vec2 centerCoords = (v_textureCoordinates - 0.5) * 2.0;

    // Calculate distance from center
    float dist = length(centerCoords);

    // Inner radius calculated from outer radius and thickness
    float innerRadius = u_radius - u_thickness;

    // 1. Outer edge smoothstep (fades out as dist exceeds u_radius)
    float outerAlpha = 1.0 - smoothstep(u_radius - u_softness, u_radius, dist);

    // 2. Inner edge smoothstep (fades in as dist exceeds innerRadius)
    float innerAlpha = smoothstep(innerRadius - u_softness, innerRadius, dist);

    // Combine both masks for the ring alpha
    float alpha = outerAlpha * innerAlpha;

    // Output final color modulated by the donut alpha mask
    outColor = vec4(u_color.rgb, u_color.a * alpha);

}