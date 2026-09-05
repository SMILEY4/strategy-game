use crate::js::models::SpriteSheetEntry;
use crate::render::Renderer;

impl Renderer {

    /// add the sprite sheet entries with the given group id
    pub fn add_spritesheet_entries(&mut self, group_id: u8, entries: Vec<SpriteSheetEntry>) {
        self.config
            .spritesheet_entries
            .insert(group_id as i32, entries);
    }
    
}
