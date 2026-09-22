/// Smooths a path with centripetal Catmull-Rom interpolation.
pub fn smooth_path(path: &[[f32; 2]], subdivisions_per_segment: usize) -> Vec<[f32; 2]> {
    if path.len() < 2 {
        return path.to_vec();
    }

    let subdivisions_per_segment = subdivisions_per_segment.max(1);
    let segment_count = path.len() - 1;
    let mut smooth_path = Vec::with_capacity(segment_count * subdivisions_per_segment + 1);

    for segment in 0..segment_count {
        let p0 = if segment == 0 { path[0] } else { path[segment - 1] };
        let p1 = path[segment];
        let p2 = path[segment + 1];
        let p3 = if segment + 2 < path.len() {
            path[segment + 2]
        } else {
            path[path.len() - 1]
        };

        let t0 = 0.0;
        let t1 = t0 + distance(p0, p1).sqrt();
        let t2 = t1 + distance(p1, p2).sqrt();
        let t3 = t2 + distance(p2, p3).sqrt();

        for subdivision in 0..subdivisions_per_segment {
            let t = t1 + (t2 - t1) * subdivision as f32 / subdivisions_per_segment as f32;
            smooth_path.push(interpolate_centripetal(p0, p1, p2, p3, t0, t1, t2, t3, t));
        }
    }

    smooth_path.push(*path.last().unwrap());
    smooth_path
}

/// Calculates the Euclidean distance between two points.
fn distance(a: [f32; 2], b: [f32; 2]) -> f32 {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    (dx * dx + dy * dy).sqrt()
}

/// Interpolates a point using centripetal Catmull-Rom interpolation.
fn interpolate_centripetal(
    p0: [f32; 2],
    p1: [f32; 2],
    p2: [f32; 2],
    p3: [f32; 2],
    t0: f32,
    t1: f32,
    t2: f32,
    t3: f32,
    t: f32,
) -> [f32; 2] {
    fn interpolate(a: [f32; 2], b: [f32; 2], ta: f32, tb: f32, t: f32) -> [f32; 2] {
        if (tb - ta).abs() < f32::EPSILON {
            return a;
        }

        let factor = (t - ta) / (tb - ta);
        [
            a[0] + (b[0] - a[0]) * factor,
            a[1] + (b[1] - a[1]) * factor,
        ]
    }

    let a1 = interpolate(p0, p1, t0, t1, t);
    let a2 = interpolate(p1, p2, t1, t2, t);
    let a3 = interpolate(p2, p3, t2, t3, t);
    let b1 = interpolate(a1, a2, t0, t2, t);
    let b2 = interpolate(a2, a3, t1, t3, t);
    interpolate(b1, b2, t1, t2, t)
}
