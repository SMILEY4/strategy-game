package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

enum class TileVisibilityDTO {
    UNKNOWN,
    DISCOVERED,
    VISIBLE
}

fun TileVisibilityDTO.isAtLeast(visibility: TileVisibilityDTO): Boolean {
    return when (visibility) {
        TileVisibilityDTO.UNKNOWN -> true
        TileVisibilityDTO.DISCOVERED -> this == TileVisibilityDTO.DISCOVERED || this == TileVisibilityDTO.VISIBLE
        TileVisibilityDTO.VISIBLE -> this == TileVisibilityDTO.VISIBLE
    }
}
