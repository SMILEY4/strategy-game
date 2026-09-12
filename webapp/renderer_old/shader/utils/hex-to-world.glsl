// Convert axial hex coordinates (q, r) to the world position on the y = 0 ground plane.
// Pointy-top orientation with unit size. Keep in sync with `hexToWorld` in
// `src/modules/utilities/hex-geometry.ts`.
const float SQRT_3 = 1.7320508075688772;

vec3 hexToWorldCenter(vec2 tilePosition) {
    float worldX = SQRT_3 * tilePosition.x + SQRT_3 / 2.0 * tilePosition.y;
    float worldZ = 3.0 / 2.0 * tilePosition.y;
    return vec3(worldX, 0.0, worldZ);
}