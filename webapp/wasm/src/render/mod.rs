use crate::render::config::Config;
use crate::render::gpu::tile_grid::build_tile_grid_data;
use crate::render::state_output::OutputState;
use crate::render::state_render::RenderState;

mod state_render;
mod state_output;
mod config;
mod renderer_access;
mod models;
mod renderer_configure;
mod renderer_setters;
mod renderer_operations;
pub mod statial;
pub mod gpu;

pub struct Renderer {
    config: Config,
    state: RenderState,
    output: OutputState,
}

impl Renderer {
    pub fn new() -> Self {
        Self {
            config: Config::default(),
            state: RenderState::default(),
            output: OutputState::default(),
        }
    }

    pub fn initialize(&mut self) {
        build_tile_grid_data(&mut self.output)
    }
}
