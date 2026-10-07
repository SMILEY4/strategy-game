#[derive(Clone, Copy)]
pub struct RealmColor {
    pub red: f32,
    pub green: f32,
    pub blue: f32,
}

impl RealmColor {

    pub const NEUTRAL: RealmColor = RealmColor {
        red: 0.5,
        green: 0.5,
        blue: 0.5,
    };

    pub fn from_rgb(red: u8, green: u8, blue: u8) -> Self {
        Self {
            red: red as f32 / 255.0,
            green: green as f32 / 255.0,
            blue: blue as f32 / 255.0,
        }
    }

    pub fn with_alpha(self, alpha: f32) -> [f32; 4] {
        [self.red, self.green, self.blue, alpha]
    }

}
