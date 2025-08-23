pub fn mix(x: &[f32; 3], y: &[f32; 3], a: f32) -> [f32; 3] {
    let clamped_a = a.clamp(0.0, 1.0);
    [
        x[0] * (1.0 - clamped_a) + y[0] * clamped_a,
        x[1] * (1.0 - clamped_a) + y[1] * clamped_a,
        x[2] * (1.0 - clamped_a) + y[2] * clamped_a,
    ]
}

pub struct Random {
    seed_internal: u64,
}

impl Random {

    pub fn new(seed: u64) -> Self {
        Self { seed_internal: seed }
    }

    pub fn u64(&mut self) -> u64 {
        self.seed_internal = self.seed_internal.wrapping_mul(6364136223846793005).wrapping_add(1);
        self.seed_internal
    }

    pub fn f64(&mut self) -> f64 {
        let bits = self.u64() >> 11;
        let max = (1u64 << 53) - 1;
        (bits & max) as f64 / max as f64
    }

    pub fn f32(&mut self) -> f32 {
        let bits = (self.u64() >> 40) as u32;
        let max = (1u32 << 24) - 1;
        (bits & max) as f32 / max as f32
    }

}