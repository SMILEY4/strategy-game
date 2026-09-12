out vec3 v_barycentric;

void computeBarycentricCoordinates() {
    int index = gl_VertexID % 3;
    if (index == 0) {
        v_barycentric = vec3(1.0, 0.0, 0.0);
    } else if (index == 1) {
        v_barycentric = vec3(0.0, 1.0, 0.0);
    } else {
        v_barycentric = vec3(0.0, 0.0, 1.0);
    }
}