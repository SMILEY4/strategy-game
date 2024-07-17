package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.GameExtended


data class CreateBuildingData(
    val game: GameExtended,
    val city: City,
    val type: BuildingType
)