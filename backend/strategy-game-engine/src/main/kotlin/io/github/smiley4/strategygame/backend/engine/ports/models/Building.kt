package io.github.smiley4.strategygame.backend.engine.ports.models

import io.github.smiley4.strategygame.backend.common.detaillog.DetailLog
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.models.TileRef


class Building(
    val type: BuildingType,
    val tile: TileRef?,
    var active: Boolean,
    val details: DetailLog<BuildingDetailType>
)