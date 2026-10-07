#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub enum MapMode {
    #[default]
    Terrain,
    Political,
    SettlementLocations,
}

impl MapMode {

    pub const fn from_numeric_id(id: u32) -> Self {
        match id {
            1 => Self::Terrain,
            2 => Self::Political,
            3 => Self::SettlementLocations,
            _ => Self::Terrain,
        }
    }

    pub const fn overlay_behavior(self) -> OverlayBehavior {
        match self {
            Self::Terrain => OverlayBehavior {
                fill: OverlayFill::None,
                edge: OverlayEdge::None,
                show_entity_control: true,
            },
            Self::Political => OverlayBehavior {
                fill: OverlayFill::Political,
                edge: OverlayEdge::Political,
                show_entity_control: true,
            },
            Self::SettlementLocations => OverlayBehavior {
                fill: OverlayFill::SettlementLocations,
                edge: OverlayEdge::None,
                show_entity_control: true,
            },
        }
    }

}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct OverlayBehavior {
    pub fill: OverlayFill,
    pub edge: OverlayEdge,
    pub show_entity_control: bool,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum OverlayFill {
    None,
    Political,
    SettlementLocations,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum OverlayEdge {
    None,
    Political,
}
