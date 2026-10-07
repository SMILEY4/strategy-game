use crate::js::models::HexPosition;

pub struct RouteSegment {
    pub route_ids: Vec<u32>,
    pub connected_entity_ids: Vec<u32>,
    pub points: Vec<HexPosition>,
}
