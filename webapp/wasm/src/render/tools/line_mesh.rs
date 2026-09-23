/// Builds a triangle-list line mesh from world-space waypoints.
///
/// The factory converts each generated position and texture coordinate into
/// the caller's GPU vertex type.
pub fn build_line_mesh<T, F>(path: &[[f32; 2]], width: f32, mut vertex_factory: F) -> Vec<T>
where
    F: FnMut([f32; 2], [f32; 2]) -> T,
{
    if path.len() < 2 || width <= 0.0 {
        return Vec::new();
    }

    let segment_lengths = segment_lengths(path);
    let total_length: f32 = segment_lengths.iter().sum();
    if total_length <= f32::EPSILON {
        return Vec::new();
    }

    let offsets = vertex_offsets(path, &segment_lengths, width);
    let mut vertices = Vec::with_capacity((path.len() - 1) * 6);
    let mut distance_along_path = 0.0;

    for (segment_index, (segment, length)) in path.windows(2).zip(segment_lengths).enumerate() {
        if length <= f32::EPSILON {
            continue;
        }

        let left_start = offset_point(segment[0], offsets[segment_index]);
        let right_start = offset_point(segment[0], negate(offsets[segment_index]));
        let left_end = offset_point(segment[1], offsets[segment_index + 1]);
        let right_end = offset_point(segment[1], negate(offsets[segment_index + 1]));
        let start_u = distance_along_path / total_length;
        let end_u = (distance_along_path + length) / total_length;

        vertices.extend([
            vertex_factory(left_start, [start_u, 0.0]),
            vertex_factory(right_start, [start_u, 1.0]),
            vertex_factory(right_end, [end_u, 1.0]),
            vertex_factory(left_start, [start_u, 0.0]),
            vertex_factory(right_end, [end_u, 1.0]),
            vertex_factory(left_end, [end_u, 0.0]),
        ]);

        distance_along_path += length;
    }

    vertices
}

/// Calculates the length of each line segment.
fn segment_lengths(path: &[[f32; 2]]) -> Vec<f32> {
    path.windows(2)
        .map(|segment| distance(segment[0], segment[1]))
        .collect()
}

/// Calculates the mitered half-width offset at every waypoint.
fn vertex_offsets(path: &[[f32; 2]], lengths: &[f32], width: f32) -> Vec<[f32; 2]> {
    let directions: Vec<[f32; 2]> = path
        .windows(2)
        .zip(lengths)
        .map(|(segment, &length)| direction(segment[0], segment[1], length))
        .collect();
    let normals: Vec<[f32; 2]> = directions
        .iter()
        .map(|direction| [-direction[1], direction[0]])
        .collect();
    let half_width = width / 2.0;

    (0..path.len())
        .map(|index| {
            let normal = if index == 0 {
                normals[0]
            } else if index == path.len() - 1 {
                normals[normals.len() - 1]
            } else {
                miter_normal(normals[index - 1], normals[index])
            };
            [normal[0] * half_width, normal[1] * half_width]
        })
        .collect()
}

/// Calculates a normalized segment direction, handling zero-length segments.
fn direction(start: [f32; 2], end: [f32; 2], length: f32) -> [f32; 2] {
    if length <= f32::EPSILON {
        return [0.0, 0.0];
    }
    [(end[0] - start[0]) / length, (end[1] - start[1]) / length]
}

/// Calculates the miter normal where two line segments meet.
fn miter_normal(previous: [f32; 2], next: [f32; 2]) -> [f32; 2] {
    let miter = normalize([previous[0] + next[0], previous[1] + next[1]]);
    let miter_scale = dot(miter, next);
    if miter_scale.abs() <= f32::EPSILON {
        next
    } else {
        [miter[0] / miter_scale, miter[1] / miter_scale]
    }
}

/// Applies an offset to a point.
fn offset_point(point: [f32; 2], offset: [f32; 2]) -> [f32; 2] {
    [point[0] + offset[0], point[1] + offset[1]]
}

/// Negates a two-dimensional vector.
fn negate(vector: [f32; 2]) -> [f32; 2] {
    [-vector[0], -vector[1]]
}

/// Calculates the Euclidean distance between two points.
fn distance(a: [f32; 2], b: [f32; 2]) -> f32 {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    (dx * dx + dy * dy).sqrt()
}

/// Calculates the dot product of two vectors.
fn dot(a: [f32; 2], b: [f32; 2]) -> f32 {
    a[0] * b[0] + a[1] * b[1]
}

/// Normalizes a vector, returning zero for a zero-length vector.
fn normalize(vector: [f32; 2]) -> [f32; 2] {
    let length = (vector[0] * vector[0] + vector[1] * vector[1]).sqrt();
    if length <= f32::EPSILON {
        [0.0, 0.0]
    } else {
        [vector[0] / length, vector[1] / length]
    }
}
