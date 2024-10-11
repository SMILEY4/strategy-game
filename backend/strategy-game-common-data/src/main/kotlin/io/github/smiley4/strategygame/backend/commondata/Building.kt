package io.github.smiley4.strategygame.backend.commondata


class Building(
    val type: BuildingType,
    var workedTile: TileRef?,
    var active: Boolean,
    val details: DetailLog<BuildingDetailType>
)