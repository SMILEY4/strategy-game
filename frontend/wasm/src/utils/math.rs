pub fn mix(x: &[f32; 3], y: &[f32; 3], a: f32) -> [f32; 3] {
    let clamped_a = a.clamp(0.0, 1.0);
    [
        x[0] * (1.0 - clamped_a) + y[0] * clamped_a,
        x[1] * (1.0 - clamped_a) + y[1] * clamped_a,
        x[2] * (1.0 - clamped_a) + y[2] * clamped_a,
    ]
}