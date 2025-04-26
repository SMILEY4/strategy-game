/*
 * Convert the given screen coordinates [0-1] to world coordinates
*/
vec2 map_screenToWorld(mat3 invViewProjection, vec2 screen) {
    return (invViewProjection * vec3(screen * 2.0 - 1.0, 1.0)).xy;
}