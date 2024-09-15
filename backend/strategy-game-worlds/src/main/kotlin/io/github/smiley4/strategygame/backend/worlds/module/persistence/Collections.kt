package io.github.smiley4.strategygame.backend.worlds.module.persistence

internal object Collections {

    const val GAMES = "games"
    const val COUNTRIES = "countries"
    const val TILES = "tiles"
    const val SETTLEMENTS = "settlements"
    const val COMMANDS = "commands"
    const val PROVINCES = "provinces"
    const val ROUTES = "routes"
    const val WORLD_OBJECTS = "worldobjects"


    val ALL = listOf(
        GAMES,
        COUNTRIES,
        TILES,
        SETTLEMENTS,
        COMMANDS,
        PROVINCES,
        ROUTES,
        WORLD_OBJECTS
    )

}