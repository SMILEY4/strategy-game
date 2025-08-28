/// mix the individual elements of "x" with "y" according to "a".
/// "a" = 0.0 => returns "x"
/// "a" = 1.0 => returns "y"
/// "a" = 0.5 => return 50% of "x" mixed with 50% of "y"
pub fn mix(x: &[f32; 3], y: &[f32; 3], a: f32) -> [f32; 3] {
    let clamped_a = a.clamp(0.0, 1.0);
    [
        x[0] * (1.0 - clamped_a) + y[0] * clamped_a,
        x[1] * (1.0 - clamped_a) + y[1] * clamped_a,
        x[2] * (1.0 - clamped_a) + y[2] * clamped_a,
    ]
}

/// converts the given rgb color with f32 values in 0..1 to a rgb color with u8 values in 0..255.
pub fn rgb_f32_to_u8(color: &[f32; 3]) -> [u8; 3] {
    [
        (color[0] * 255.0) as u8,
        (color[1] * 255.0) as u8,
        (color[2] * 255.0) as u8,
    ]
}

/// converts the given rgba color with f32 values in 0..1 to a rgba color with u8 values in 0..255.
pub fn rgba_f32_to_u8(color: &[f32; 4]) -> [u8; 4] {
    [
        (color[0] * 255.0) as u8,
        (color[1] * 255.0) as u8,
        (color[2] * 255.0) as u8,
        (color[3] * 255.0) as u8,
    ]
}

/// A triangle wave function triangle(x) with given frequency "f".
/// See: https://www.desmos.com/calculator/ivdvmfo7or
pub fn triangle_wave(x: f32, f: f32) -> f32 {
    if ((x * f) % 1.0) < 0.5 {
        ((x * f) % 1.0) * 4.0 - 1.0
    } else {
        3.0 + ((x * f) % 1.0) * -4.0
    }
}

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

/// A 2d rectangle
#[derive(Default, Copy, Clone)]
pub struct Rect2d {
    pub min_x: f32,
    pub min_y: f32,
    pub max_x: f32,
    pub max_y: f32,
}

impl Rect2d {
    /// return whether the given point (x,y) is inside (or on the bounds of) this rectangle.
    pub fn contains_point(&self, x: f32, y: f32) -> bool {
        self.min_x <= x && x <= self.max_x && self.min_y <= y && y <= self.max_y
    }

    /// return whether the given point p is inside (or on the bounds of) this rectangle.
    pub fn contains(&self, p: &Vec2d) -> bool {
        self.contains_point(p.x, p.y)
    }
}

/// A 2d vector
#[derive(Default, Copy, Clone)]
pub struct Vec2d {
    pub x: f32,
    pub y: f32,
}

impl Vec2d {
    /// Constant vector (0,0
    pub const ZERO: Vec2d = Vec2d { x: 0.0, y: 0.0 };

    /// Create a new vector pointing from the position "from" to the position "to".
    pub fn from_vec2d(from: &Vec2d, to: &Vec2d) -> Self {
        Self {
            x: to.x - from.x,
            y: to.y - from.y,
        }
    }

    /// Create a new vector pointing from the position "from" to the position "to".
    pub fn from_points(from: [f32; 2], to: [f32; 2]) -> Self {
        Self {
            x: to[0] - from[0],
            y: to[1] - from[1],
        }
    }

    /// returns a copy of this vector.
    pub fn copy(&self) -> Vec2d {
        Vec2d {
            x: self.x,
            y: self.y,
        }
    }

    /// returns a new vector pointing from the position of this vector to the given position "to".
    pub fn to(&self, to: &Vec2d) -> Vec2d {
        Vec2d {
            x: to.x - self.x,
            y: to.y - self.y,
        }
    }

    /// returns the squared length of this vector
    pub fn length2(&self) -> f32 {
        self.x * self.x + self.y * self.y
    }

    /// returns the length of this vector
    pub fn length(&self) -> f32 {
        self.length2().sqrt()
    }

    /// returns the squared distance between the position of this vector and the given other vector.
    pub fn distance2(&self, other: &Vec2d) -> f32 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        dx * dx + dy * dy
    }

    /// returns the distance between the position of this vector and the given other vector.
    pub fn distance(&self, other: &Vec2d) -> f32 {
        self.distance2(other).sqrt()
    }

    /// returns a new vector with the same direction as this vector and length 1.
    pub fn normalize(&self) -> Vec2d {
        let length = self.length();
        Vec2d {
            x: self.x / length,
            y: self.y / length,
        }
    }

    /// returns a new vector with the same direction as this vector but multiplied by the given scalar.
    pub fn scale(&self, scalar: f32) -> Vec2d {
        Vec2d {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    /// returns a new vector from the addition of this vector and the given other vector.
    pub fn add(&self, other: &Vec2d) -> Vec2d {
        Vec2d {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }

    /// returns the dot product between this vector and the given other vector.
    pub fn dot(&self, other: &Vec2d) -> f32 {
        self.x * other.x + self.y * other.y
    }

    /// returns a new vector created by rotating this vector 90 degrees clockwise.
    pub fn rotate_90deg_cw(&self) -> Vec2d {
        Vec2d {
            x: self.y,
            y: -self.x,
        }
    }

    /// returns a new vector created by rotating this vector 90 degrees counter-clockwise.
    pub fn rotate_90deg_cc(&self) -> Vec2d {
        Vec2d {
            x: -self.y,
            y: self.x,
        }
    }
}

/// Calculate a curve starting from "a" and ending at "c", following the lines "ab" and "bc".
/// returns the point at progress "t".
/// t = 0.0 => returns "a"
/// t = 1.0 => returns "c"
/// t = 0.5 => returns point on curve halfway between a and c
pub fn interpolate_curve(a: &Vec2d, b: &Vec2d, c: &Vec2d, t: f32) -> Vec2d {
    let ab_t = a.to(b).scale(t);
    let bc_t = b.to(c).scale(t);
    let x1 = a.add(&ab_t);
    let x2 = b.add(&bc_t);
    let x_t = x1.to(&x2).scale(t);
    x1.add(&x_t)
}
