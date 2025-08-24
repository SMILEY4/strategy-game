use std::ops::Add;

pub fn mix(x: &[f32; 3], y: &[f32; 3], a: f32) -> [f32; 3] {
    let clamped_a = a.clamp(0.0, 1.0);
    [
        x[0] * (1.0 - clamped_a) + y[0] * clamped_a,
        x[1] * (1.0 - clamped_a) + y[1] * clamped_a,
        x[2] * (1.0 - clamped_a) + y[2] * clamped_a,
    ]
}

pub fn triangle_wave(x: f32, f: f32) -> f32 {
    // source: https://www.desmos.com/calculator/ivdvmfo7or
    if ((x * f) % 1.0) < 0.5 {
        ((x*f) % 1.0) * 4.0 - 1.0
    } else {
        3.0 + ((x*f) % 1.0) * -4.0
    }
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

pub struct Vec2d {
    pub x: f32,
    pub y: f32,
}

impl Vec2d {

    pub const ZERO: Vec2d = Vec2d { x: 0.0, y: 0.0 };
    
    pub fn from_vec2d(from: &Vec2d, to: &Vec2d) -> Self {
        Self {
            x: to.x - from.x,
            y: to.y - from.y,
        }
    }

    pub fn from_points(from: [f32;2], to: [f32;2]) -> Self {
        Self {
            x: to[0] - from[0],
            y: to[1] - from[1],
        }
    }

    pub fn copy(&self) -> Vec2d {
        Vec2d {
            x: self.x,
            y: self.y,
        }
    }

    pub fn to(&self, to: &Vec2d) -> Vec2d {
        Vec2d {
            x: to.x - self.x,
            y: to.y - self.y,
        }
    }

    pub fn length2(&self) -> f32 {
        self.x * self.x + self.y * self.y
    }

    pub fn length(&self) -> f32 {
        self.length2().sqrt()
    }

    pub fn distance2(&self, other: &Vec2d) -> f32 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        dx * dx + dy * dy
    }

    pub fn distance(&self, other: &Vec2d) -> f32 {
        self.distance2(other).sqrt()
    }

    pub fn normalize(&self) -> Vec2d {
        let length = self.length();
        Vec2d {
            x: self.x / length,
            y: self.y / length,
        }
    }

    pub fn scale(&self, scalar: f32) -> Vec2d {
        Vec2d {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    pub fn add(&self, other: &Vec2d) -> Vec2d {
        Vec2d {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }

    pub fn dot(&self, other: &Vec2d) -> f32 {
        self.x * other.x + self.y * other.y
    }

    pub fn rotate_90deg_cw(&self) -> Vec2d {
        Vec2d {
            x: self.y,
            y: -self.x,
        }
    }

    pub fn rotate_90deg_cc(&self) -> Vec2d {
        Vec2d {
            x: -self.y,
            y: self.x,
        }
    }
}

pub fn interpolate_curve(a: &Vec2d, b: &Vec2d, c: &Vec2d, t: f32) -> Vec2d {
    let ab_t = a.to(b).scale(t);
    let bc_t = b.to(c).scale(t);
    let x1 = a.add(&ab_t);
    let x2 = b.add(&bc_t);
    let x_t = x1.to(&x2).scale(t);
    x1.add(&x_t)
}