use crate::utils::Vec2d;

#[derive(Copy, Clone)]
pub struct LineMeshVertex {
    pub x: f32,
    pub y: f32,
    pub u: f32,
    pub v: f32,
}

pub struct LineMesh {
    pub vertices: Vec<LineMeshVertex>,
    pub attachment_indices: Vec<usize>,
    pub triangles: Vec<[usize; 3]>,
}

pub struct LineMeshConfig {
    pub thickness: f32,
    pub cap_start: fn(thickness: f32, curr_point: &Vec2d, next_point: &Vec2d) -> LineMesh,
    pub cap_end: fn(thickness: f32, prev_point: &Vec2d, curr_point: &Vec2d) -> LineMesh,
    pub join: fn(thickness: f32, prev_point: &Vec2d, curr_point: &Vec2d, next_point: &Vec2d, current_length: f32, total_length: f32) -> LineMesh,
}

//==== MESH BUILDER ==================

pub fn flatten(mesh: &LineMesh) -> Vec<LineMeshVertex> {
    let mut vertices = Vec::new();

    for triangle in &mesh.triangles {
        vertices.push(mesh.vertices[triangle[0]].clone());
        vertices.push(mesh.vertices[triangle[1]].clone());
        vertices.push(mesh.vertices[triangle[2]].clone());
    }

    vertices
}

pub fn build_line_mesh(points: &Vec<Vec2d>, config: &LineMeshConfig) -> LineMesh {
    if points.len() <= 1 || config.thickness <= 0.0 {
        return LineMesh {
            vertices: vec![],
            attachment_indices: vec![],
            triangles: vec![],
        }
    }

    let mut mesh = LineMesh {
        vertices: Vec::new(),
        attachment_indices: Vec::new(),
        triangles: Vec::new(),
    };

    let total_length = calc_total_length(points);

    for index in 0..points.len() {
        if index == 0 {
            build_segment_start(
                &mut mesh,
                &points[index],
                &points[index+1],
                config
            )
        } else if index == points.len() - 1 {
            build_segment_end(
                &mut mesh,
                &points[index-1],
                &points[index],
                config
            )
        } else {
            build_segment_middle(
                &mut mesh,
                &points[index-1],
                &points[index],
                &points[index+1],
                calc_total_length(&points[0..index+1]),
                total_length,
                config
            )
        }
    }

    mesh
}

fn build_segment_start(mesh: &mut LineMesh, curr_point: &Vec2d, next_point: &Vec2d, config: &LineMeshConfig) {
    // create segment mesh
    let mesh_data = (config.cap_start)(config.thickness, curr_point, next_point);

    // append vertices to final mesh
    mesh.vertices.extend(mesh_data.vertices);

    // append triangles to final mesh (mesh always empty before, indices always start at 0)
    mesh.triangles.extend(mesh_data.triangles);

    // set indices of vertices to connect next segment to
    mesh.attachment_indices = vec![mesh_data.attachment_indices[2], mesh_data.attachment_indices[3]]
}

fn build_segment_end(mesh: &mut LineMesh, prev_point: &Vec2d, curr_point: &Vec2d, config: &LineMeshConfig) {
    // create segment mesh
    let mut mesh_data = (config.cap_end)(config.thickness, prev_point, curr_point);

    let vertex_index_offset = mesh.vertices.len();

    // update segment vertex indices (segment mesh starts at 0, but final mesh might be at a higher index already)
    for i in 0..mesh_data.triangles.len() {
        for j in 0..mesh_data.triangles[i].len() {
            mesh_data.triangles[i][j] = mesh_data.triangles[i][j] + vertex_index_offset;
        }
    }

    // create connecting triangles for previous and new segment
    let prev_attachment_index_0 = mesh.attachment_indices[0];
    let prev_attachment_index_1 = mesh.attachment_indices[1];
    let next_attachment_index_0 = mesh_data.attachment_indices[0] + vertex_index_offset;
    let next_attachment_index_1 = mesh_data.attachment_indices[1] + vertex_index_offset;
    mesh.triangles.push([prev_attachment_index_0,prev_attachment_index_1,next_attachment_index_1]);
    mesh.triangles.push([prev_attachment_index_0,next_attachment_index_0,next_attachment_index_1]);

    // append vertices to final mesh
    mesh.vertices.extend(mesh_data.vertices);

    // append triangles to final mesh (indices already properly offset)
    mesh.triangles.extend(mesh_data.triangles);

    // set indices of vertices to connect next segment to (calculate correct indices)
    mesh.attachment_indices = vec![mesh_data.attachment_indices[2] + vertex_index_offset, mesh_data.attachment_indices[3] + vertex_index_offset]
}

fn build_segment_middle(mesh: &mut LineMesh, prev_point: &Vec2d, curr_point: &Vec2d, next_point: &Vec2d, current_length: f32, total_length: f32, config: &LineMeshConfig) {
    // create segment mesh
    let mut mesh_data = (config.join)(config.thickness, prev_point, curr_point, next_point, current_length, total_length);

    let vertex_index_offset = mesh.vertices.len();

    // update segment vertex indices (segment mesh starts at 0, but final mesh might be at a higher index already)
    for i in 0..mesh_data.triangles.len() {
        for j in 0..mesh_data.triangles[i].len() {
            mesh_data.triangles[i][j] = mesh_data.triangles[i][j] + vertex_index_offset;
        }
    }

    // create connecting triangles for previous and new segment
    let prev_attachment_index_0 = mesh.attachment_indices[0];
    let prev_attachment_index_1 = mesh.attachment_indices[1];
    let next_attachment_index_0 = mesh_data.attachment_indices[0] + vertex_index_offset;
    let next_attachment_index_1 = mesh_data.attachment_indices[1] + vertex_index_offset;
    mesh.triangles.push([prev_attachment_index_0,prev_attachment_index_1,next_attachment_index_1]);
    mesh.triangles.push([prev_attachment_index_0,next_attachment_index_0,next_attachment_index_1]);

    // append vertices to final mesh
    mesh.vertices.extend(mesh_data.vertices);

    // append triangles to final mesh (indices already properly offset)
    mesh.triangles.extend(mesh_data.triangles);

    // set indices of vertices to connect next segment to (calculate correct indices)
    mesh.attachment_indices = vec![mesh_data.attachment_indices[2] + vertex_index_offset, mesh_data.attachment_indices[3] + vertex_index_offset]
}

fn calc_total_length(points: &[Vec2d]) -> f32 {
    let mut total = 0.0;
    for pair in points.windows(2) {
        total += pair[0].distance(&pair[1])
    }
    total
}

//==== CAPS ==========================

pub fn cap_butt_start(thickness: f32, curr_point: &Vec2d, next_point: &Vec2d) -> LineMesh {
    let direction = curr_point.to(next_point).normalize();
    let p0 = direction.rotate_90deg_cw().scale(thickness / 2.0).add(curr_point);
    let p1 = direction.rotate_90deg_cc().scale(thickness / 2.0).add(curr_point);
    LineMesh {
        vertices: vec![
            LineMeshVertex {
                x: p0.x,
                y: p0.y,
                u: 0.0,
                v: 0.0,
            },
            LineMeshVertex {
                x: p1.x,
                y: p1.y,
                u: 0.0,
                v: 1.0,
            },
        ],
        attachment_indices: vec![0, 1, 0, 1],
        triangles: vec![],
    }
}

pub fn cap_butt_end(thickness: f32, prev_point: &Vec2d, curr_point: &Vec2d) -> LineMesh {
    let direction = prev_point.to(curr_point).normalize();
    let p0 = direction.rotate_90deg_cw().scale(thickness / 2.0).add(curr_point);
    let p1 = direction.rotate_90deg_cc().scale(thickness / 2.0).add(curr_point);
    LineMesh {
        vertices: vec![
            LineMeshVertex {
                x: p0.x,
                y: p0.y,
                u: 1.0,
                v: 0.0,
            },
            LineMeshVertex {
                x: p1.x,
                y: p1.y,
                u: 1.0,
                v: 1.0,
            },
        ],
        attachment_indices: vec![0, 1, 0, 1],
        triangles: vec![],
    }
}

//==== JOINS =========================

pub fn join_miter(thickness: f32, prev_point: &Vec2d, curr_point: &Vec2d, next_point: &Vec2d, current_length: f32, total_length: f32) -> LineMesh {
    let direction_in = prev_point.to(curr_point).normalize();
    let direction_out = curr_point.to(next_point).normalize();
    let direction = direction_in.add(&direction_out).normalize();

    let miter0 = direction.rotate_90deg_cw();
    let miter1 = direction.rotate_90deg_cc();
    let miter_half_thickness = (thickness / 2.0) / miter0.dot(&direction_in.rotate_90deg_cw());

    let p0 = miter0.scale(miter_half_thickness).add(curr_point);
    let p1 = miter1.scale(miter_half_thickness).add(curr_point);

    let progress = current_length / total_length;

    LineMesh {
        vertices: vec![
            LineMeshVertex {
                x: p0.x,
                y: p0.y,
                u: progress,
                v: 0.0,
            },
            LineMeshVertex {
                x: p1.x,
                y: p1.y,
                u: progress,
                v: 1.0,
            },
        ],
        attachment_indices: vec![0, 1, 0, 1],
        triangles: vec![],
    }
}
