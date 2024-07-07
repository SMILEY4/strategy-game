package io.github.smiley4.strategygame.backend.commondata


class Building(
    val type: BuildingType,
    val tile: TileRef?,
    var active: Boolean,
    val details: DetailLog<BuildingDetailType>
)