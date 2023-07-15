package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.utils.RGBColor

data class ColorEntity(
    val red: Int,
    val green: Int,
    val blue: Int
) {

    companion object {
        fun of(color: RGBColor) = ColorEntity(
            red = color.red,
            green = color.green,
            blue = color.blue
        )
    }

    fun toRGBColor() = RGBColor(
        red = this.red,
        green = this.green,
        blue = this.blue
    )

}