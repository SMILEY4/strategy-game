#version 300 es
#line 2
precision mediump float;

in vec3 v_color;
out vec4 outColor;


void main() {
    //    wireframe rendering
    //    float f_thickness = 0.05;
    //    float f_closest_edge = min(v_color.x, min(v_color.y, v_color.z));
    //    float f_width = fwidth(f_closest_edge);
    //    float f_alpha = smoothstep(f_thickness, f_thickness + f_width, f_closest_edge);
    //    outColor = vec4(v_color, 1.0-f_alpha);


    outColor = mix(
        mix(vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0), v_color.y),
        mix(vec4(1.0, 1.0, 0.0, 1.0), vec4(0.0, 1.0, 1.0, 1.0), v_color.y),
        v_color.x
    );

}
