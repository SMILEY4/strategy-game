package de.ruegnerlukas.strategygame.backend.ports.models

sealed class PlayerCommand


class PlaceMarkerCommand(
    val q: Int,
    val r: Int,
) : PlayerCommand()


class CreateCityCommand(
    val q: Int,
    val r: Int,
    val name: String,
    val withNewProvince: Boolean
) : PlayerCommand()


class CreateBuildingCommand(
    val cityId: String,
    val buildingType: BuildingType,
) : PlayerCommand()


class PlaceScoutCommand(
    val q: Int,
    val r: Int,
) : PlayerCommand()
