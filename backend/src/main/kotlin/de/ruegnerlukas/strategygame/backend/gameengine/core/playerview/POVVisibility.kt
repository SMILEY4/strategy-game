package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

enum class VisibilityDTO {
    UNKNOWN,
    DISCOVERED,
    VISIBLE
}

fun VisibilityDTO.isAtLeast(visibility: VisibilityDTO): Boolean {
    return when (visibility) {
        VisibilityDTO.UNKNOWN -> true
        VisibilityDTO.DISCOVERED -> this == VisibilityDTO.DISCOVERED || this == VisibilityDTO.VISIBLE
        VisibilityDTO.VISIBLE -> this == VisibilityDTO.VISIBLE
    }
}
