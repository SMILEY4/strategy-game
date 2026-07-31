/// simple random number generator
pub struct Random {
    seed_internal: u64,
}

impl Random {
    /// create a new instance with the given fixed seed
    pub fn new(seed: u64) -> Self {
        Self {
            seed_internal: seed,
        }
    }

    pub fn set_seed(&mut self, seed: u64) {
        self.seed_internal = seed;
    }

    /// return the next random u64 value between 0 and max.
    pub fn u64(&mut self) -> u64 {
        self.seed_internal = self
            .seed_internal
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1);
        self.seed_internal
    }

    /// returns the random u64 value between 0 and max based on the given seed.
    /// This overwrites the internal seed and influences the next generated values.
    pub fn u64_seeded(&mut self, seed: u64) -> u64 {
        self.set_seed(seed);
        self.u64()
    }

    /// return the next random f32 value between 0 and 1.
    pub fn f32(&mut self) -> f32 {
        let bits = (self.u64() >> 40) as u32;
        let max = (1u32 << 24) - 1;
        (bits & max) as f32 / max as f32
    }

    /// returns the random f32 value between 0 and 1 based on the given seed.
    /// This overwrites the internal seed and influences the next generated values.
    pub fn f32_seeded(&mut self, seed: u64) -> f32 {
        self.set_seed(seed);
        self.f32()
    }

    /// return the next random f64 value between 0 and 1.
    pub fn f64(&mut self) -> f64 {
        let bits = self.u64() >> 11;
        let max = (1u64 << 53) - 1;
        (bits & max) as f64 / max as f64
    }

    /// returns the random f64 value between 0 and 1 based on the given seed.
    /// This overwrites the internal seed and influences the next generated values.
    pub fn f64_seeded(&mut self, seed: u64) -> f64 {
        self.set_seed(seed);
        self.f64()
    }
}