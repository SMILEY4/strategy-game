package io.github.smiley4.strategygame.backend.commondata


class Building(
    val type: BuildingType,
    var workedTile: TileRef?,
    var requirements: BuildingRequirements,
    val details: DetailLog<BuildingDetailType>
)

class BuildingRequirements(
    var fulfillsTile: Boolean,
    var fulfillsInputResources: Boolean,
)