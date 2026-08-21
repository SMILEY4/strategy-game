use std::f32::consts as f32_consts;
use std::f64::consts as f64_consts;

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

    /// return the next random u8 value.
    pub fn u8(&mut self) -> u8 {
        (self.u64() >> 56) as u8
    }

    /// return the next random u8 value between min and max (both inclusive).
    pub fn u8_range(&mut self, min: u8, max: u8) -> u8 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = (max - min) as u32 + 1;
        min + (self.u32() % span) as u8
    }

    /// return the next random i8 value.
    pub fn i8(&mut self) -> i8 {
        self.u8() as i8
    }

    /// return the next random i8 value between min and max (both inclusive).
    pub fn i8_range(&mut self, min: i8, max: i8) -> i8 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = (max as u8).wrapping_sub(min as u8).wrapping_add(1);
        if span == 0 {
            return self.u8() as i8;
        }
        min.wrapping_add((self.u8() % span) as i8)
    }

    /// return the next random u16 value.
    pub fn u16(&mut self) -> u16 {
        (self.u64() >> 48) as u16
    }

    /// return the next random u16 value between min and max (both inclusive).
    pub fn u16_range(&mut self, min: u16, max: u16) -> u16 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = (max - min) as u32 + 1;
        min + (self.u32() % span) as u16
    }

    /// return the next random i16 value.
    pub fn i16(&mut self) -> i16 {
        self.u16() as i16
    }

    /// return the next random i16 value between min and max (both inclusive).
    pub fn i16_range(&mut self, min: i16, max: i16) -> i16 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = (max as u16).wrapping_sub(min as u16).wrapping_add(1);
        if span == 0 {
            return self.u16() as i16;
        }
        min.wrapping_add((self.u16() % span) as i16)
    }

    /// return the next random u32 value.
    pub fn u32(&mut self) -> u32 {
        (self.u64() >> 32) as u32
    }

    /// return the next random u32 value between min and max (both inclusive).
    pub fn u32_range(&mut self, min: u32, max: u32) -> u32 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = max - min + 1;
        if span == 0 {
            return self.u32();
        }
        min + self.u32() % span
    }

    /// return the next random i32 value.
    pub fn i32(&mut self) -> i32 {
        self.u32() as i32
    }

    /// return the next random i32 value between min and max (both inclusive).
    pub fn i32_range(&mut self, min: i32, max: i32) -> i32 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = (max as u32).wrapping_sub(min as u32).wrapping_add(1);
        if span == 0 {
            return self.u32() as i32;
        }
        min.wrapping_add((self.u32() % span) as i32)
    }

    /// return the next random u64 value between 0 and max.
    pub fn u64(&mut self) -> u64 {
        self.seed_internal = self
            .seed_internal
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1);
        self.seed_internal
    }

    /// return the next random u64 value between min and max (both inclusive).
    pub fn u64_range(&mut self, min: u64, max: u64) -> u64 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = max - min + 1;
        if span == 0 {
            return self.u64();
        }
        min + self.u64() % span
    }

    /// return the next random i64 value.
    pub fn i64(&mut self) -> i64 {
        self.u64() as i64
    }

    /// return the next random i64 value between min and max (both inclusive).
    pub fn i64_range(&mut self, min: i64, max: i64) -> i64 {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = (max as u64).wrapping_sub(min as u64).wrapping_add(1);
        if span == 0 {
            return self.u64() as i64;
        }
        min.wrapping_add((self.u64() % span) as i64)
    }

    /// return the next random usize value.
    pub fn usize(&mut self) -> usize {
        self.u64() as usize
    }

    /// return the next random usize value between min and max (both inclusive).
    pub fn usize_range(&mut self, min: usize, max: usize) -> usize {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = max - min + 1;
        if span == 0 {
            return self.usize();
        }
        min + self.usize() % span
    }

    /// return the next random isize value.
    pub fn isize(&mut self) -> isize {
        self.i64() as isize
    }

    /// return the next random isize value between min and max (both inclusive).
    pub fn isize_range(&mut self, min: isize, max: isize) -> isize {
        if min == max {
            return min;
        }
        debug_assert!(min <= max);
        let span = (max as usize).wrapping_sub(min as usize).wrapping_add(1);
        if span == 0 {
            return self.isize();
        }
        min.wrapping_add((self.usize() % span) as isize)
    }

    /// return the next random f32 value between 0 and 1.
    pub fn f32(&mut self) -> f32 {
        let bits = (self.u64() >> 40) as u32;
        let max = (1u32 << 24) - 1;
        (bits & max) as f32 / max as f32
    }

    /// return the next random f32 value between -1 and 1 (inclusive).
    pub fn f32_signed(&mut self) -> f32 {
        self.f32() * 2.0 - 1.0
    }

    /// return the next random f32 value between min and max (inclusive).
    pub fn f32_range(&mut self, min: f32, max: f32) -> f32 {
        debug_assert!(min <= max);
        min + self.f32() * (max - min)
    }

    /// return the next random f64 value between 0 and 1.
    pub fn f64(&mut self) -> f64 {
        let bits = self.u64() >> 11;
        let max = (1u64 << 53) - 1;
        (bits & max) as f64 / max as f64
    }

    /// return the next random f64 value between -1 and 1 (inclusive).
    pub fn f64_signed(&mut self) -> f64 {
        self.f64() * 2.0 - 1.0
    }

    /// return the next random f64 value between min and max (inclusive).
    pub fn f64_range(&mut self, min: f64, max: f64) -> f64 {
        debug_assert!(min <= max);
        min + self.f64() * (max - min)
    }

    /// return the next normally distributed f64 value with the given mean and standard deviation.
    pub fn gaussian(&mut self, mean: f64, stddev: f64) -> f64 {
        let u1 = self.f64().max(f64::MIN_POSITIVE);
        let u2 = self.f64();
        let z = (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos();
        mean + z * stddev
    }

    /// return the next random boolean value.
    pub fn bool(&mut self) -> bool {
        self.u64() & 1 == 1
    }

    /// return true with the given probability p (0.0 = never, 1.0 = always).
    pub fn probability(&mut self, p: f64) -> bool {
        self.f64() < p
    }

    /// return the next random angle in radians, between 0 (inclusive) and 2*PI (exclusive).
    pub fn angle(&mut self) -> f32 {
        self.f32() * std::f32::consts::PI * 2.0
    }

    /// return the next random angle in degrees, between 0 (inclusive) and 360 (exclusive).
    pub fn angle_deg(&mut self) -> f32 {
        self.f32() * 360.0
    }

    /// return a random reference to one element of the given slice, or None if the slice is empty.
    pub fn pick<'a, T>(&mut self, slice: &'a [T]) -> Option<&'a T> {
        if slice.is_empty() {
            return None;
        }
        Some(&slice[self.usize_range(0, slice.len() - 1)])
    }

    /// shuffle the given slice in place using the Fisher-Yates algorithm.
    pub fn shuffle<T>(&mut self, slice: &mut [T]) {
        for i in (1..slice.len()).rev() {
            let j = self.usize_range(0, i);
            slice.swap(i, j);
        }
    }

    /// Generates a random point inside a 2D circle with controllable spread and distribution.
    /// - `radius`: Maximum spread of the points
    /// - `distribution`: Power exponent controlling radial density:
    ///     - `= 1.0`: Uniform spatial distribution across the area.
    ///     - `< 1.0`: Concentrates points heavily toward the center.
    ///     - `> 1.0`: Pushes points out toward the outer perimeter.
    pub fn point_in_circle_f64(&mut self, radius: f64, distribution: f64) -> [f64; 2] {
        let theta: f64 = self.f64_range(0.0, f64_consts::TAU);
        let u: f64 = self.f64();
        let r = radius * u.powf(0.5 / distribution);
        [r * theta.cos(), r * theta.sin()]
    }

    /// Generates a random point inside a 2D circle with controllable spread and distribution.
    /// - `radius`: Maximum spread of the points
    /// - `distribution`: Power exponent controlling radial density:
    ///     - `= 1.0`: Uniform spatial distribution across the area.
    ///     - `< 1.0`: Concentrates points heavily toward the center.
    ///     - `> 1.0`: Pushes points out toward the outer perimeter.
    pub fn point_in_circle_f32(&mut self, radius: f32, distribution: f32) -> [f32; 2] {
        let theta: f32 = self.f32_range(0.0, f32_consts::TAU);
        let u: f32 = self.f32();
        let r = radius * u.powf(0.5 / distribution);
        [r * theta.cos(), r * theta.sin()]
    }
}
