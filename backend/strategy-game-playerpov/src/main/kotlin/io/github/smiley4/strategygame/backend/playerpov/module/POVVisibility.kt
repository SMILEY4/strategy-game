package io.github.smiley4.strategygame.backend.playerpov.module

internal enum class TileVisibilityDTO {
    UNKNOWN,
    DISCOVERED,
    VISIBLE
}

internal fun TileVisibilityDTO.isAtLeast(visibility: TileVisibilityDTO): Boolean {
    return when (visibility) {
        TileVisibilityDTO.UNKNOWN -> true
        TileVisibilityDTO.DISCOVERED -> this == TileVisibilityDTO.DISCOVERED || this == TileVisibilityDTO.VISIBLE
        TileVisibilityDTO.VISIBLE -> this == TileVisibilityDTO.VISIBLE
    }
}


internal fun TileVisibilityDTO.isLessThan(visibility: TileVisibilityDTO): Boolean {
    return !this.isAtLeast(visibility)
}
