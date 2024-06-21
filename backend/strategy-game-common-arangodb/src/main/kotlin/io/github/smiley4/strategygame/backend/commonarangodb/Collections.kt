package io.github.smiley4.strategygame.backend.commonarangodb

object Collections {

    const val GAMES = "games"
    const val COUNTRIES = "countries"
    const val TILES = "tiles"
    const val CITIES = "cities"
    const val COMMANDS = "commands"
    const val PROVINCES = "provinces"
    const val ROUTES = "routes"

    val ALL = listOf(
        GAMES,
        COUNTRIES,
        TILES,
        CITIES,
        COMMANDS,
        PROVINCES,
        ROUTES
    )

}