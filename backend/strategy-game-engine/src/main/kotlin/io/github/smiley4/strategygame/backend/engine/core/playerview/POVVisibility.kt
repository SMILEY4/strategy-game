package io.github.smiley4.strategygame.backend.engine.core.playerview

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
