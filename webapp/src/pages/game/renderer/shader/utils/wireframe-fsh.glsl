in vec3 v_barycentric;

float computeWireframe() {
    vec3 d = fwidth(v_barycentric);
    vec3 a3 = smoothstep(vec3(0.0), d * 2.0, v_barycentric);
    float edge = min(min(a3.x, a3.y), a3.z);
    return 1.0 - step(edge, 0.99);
}