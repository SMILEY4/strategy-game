use crate::js::models::HexPosition;

impl HexPosition {

    /// Derived third cube coordinate: s = -q - r
    #[inline]
    pub fn s(&self) -> i32 {
        -self.q - self.r
    }

    /// Distance between two hex positions
    pub fn distance(&self, other: &HexPosition) -> i32 {
        self.distance_qr(other.q, other.r)
    }

    /// Distance from hex position to target coordinate (q, r)
    pub fn distance_qr(&self, q: i32, r: i32) -> i32 {
        let dq = (self.q - q).abs();
        let dr = (self.r - r).abs();
        let ds = (self.s() - (-q - r)).abs();
        (dq + dr + ds) / 2
    }

    /// Distance from the origin (0, 0, 0)
    pub fn length(&self) -> i32 {
        (self.q.abs() + self.r.abs() + self.s().abs()) / 2
    }

    /// Iterates over all hexes within `radius` distance
    pub fn iterate_circle<F>(&self, radius: i32, mut consumer: F)
    where
        F: FnMut(HexPosition),
    {
        for iq in (self.q - radius)..=(self.q + radius) {
            for ir in (self.r - radius)..=(self.r + radius) {
                if self.distance_qr(iq, ir) <= radius {
                    consumer(HexPosition { q: iq, r: ir });
                }
            }
        }
    }
}