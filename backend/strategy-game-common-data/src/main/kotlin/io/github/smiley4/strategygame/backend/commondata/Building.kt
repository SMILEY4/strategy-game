package io.github.smiley4.strategygame.backend.commondata


class Building(
    val type: BuildingType,
    var workedTile: TileRef?,
    var validity: BuildingValidity,
    val activity: BuildingActivity
)

class BuildingValidity(
    var workTile: Boolean,
    var inputResources: Boolean,
)

class BuildingActivity(
    val consumed: ResourceCollection,
    val produced: ResourceCollection,
    val missing: ResourceCollection
)