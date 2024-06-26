package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.common.utils.RGBColor


internal data class ColorEntity(
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