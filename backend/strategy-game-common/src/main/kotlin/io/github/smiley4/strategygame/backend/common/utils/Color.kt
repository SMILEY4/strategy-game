package io.github.smiley4.strategygame.backend.common.utils

import java.lang.Float.max
import java.lang.Float.min


val COUNTRY_COLORS = listOf(
    RGBColor(255, 128, 128),
    RGBColor(120, 156, 240),
    RGBColor(176, 222, 111),
    RGBColor(204, 102, 192),
    RGBColor(93, 186, 171),
    RGBColor(242, 186, 121),
    RGBColor(142, 113, 227),
    RGBColor(110, 209, 105),
    RGBColor(191, 96, 128),
    RGBColor(124, 202, 247),
)


data class RGBColor(
    val red: Int, // [0,255]
    val green: Int, // [0,255]
    val blue: Int, // [0,255]
) {
    constructor(r: Float, g: Float, b: Float) : this(
        (r * 255).toInt().coerceIn(0..255),
        (g * 255).toInt().coerceIn(0..255),
        (b * 255).toInt().coerceIn(0..255),
    )

    companion object {

        val BLACK = RGBColor(0,0,0)

        fun random() = HSLColor.random().toRgb()
    }
}


data class HSLColor(
    val hue: Float, // [0,1]
    val saturation: Float, // [0,1]
    val lightness: Float, // [0,1]
) {
    companion object {
        fun random() = HSLColor(
            Math.random().toFloat(),
            0.5f,
            0.5f
        )
    }
}


fun RGBColor.toHsl(): HSLColor {
    // Taken from https://gist.github.com/mjackson/5311256 and adapted to kotlin
    val r = this.red.toFloat() / 255f
    val g = this.green.toFloat() / 255f
    val b = this.blue.toFloat() / 255f

    val max = max(max(r, g), b)
    val min = min(min(r, g), b)

    if (max == min) {
        return HSLColor(0f, 0f, (max + min) / 2f)
    } else {
        val l = (max + min) / 2f
        val d = max - min
        val s = if (l > 0.5) d / (2f - max - min) else d / (max + min)
        val h = when (max) {
            r -> (g - b) / d + (if (g < b) 6f else 0f)
            g -> (b - r) / d + 2f
            b -> (r - g) / d + 4f
            else -> 0f
        }
        return HSLColor(h / 6f, s, l)
    }
}


fun HSLColor.toRgb(): RGBColor {
    // Taken from https://gist.github.com/mjackson/5311256 and adapted to kotlin
    if (this.saturation == 0f) {
        return RGBColor(this.lightness, this.lightness, this.lightness)
    } else {
        val q = if (this.lightness < 0.5f) {
            this.lightness * (1f + this.saturation)
        } else {
            this.lightness + this.saturation - this.lightness * this.saturation
        }
        val p = 2f * this.lightness - q
        return RGBColor(
            hue2rgb(p, q, this.hue + 1f / 3f),
            hue2rgb(p, q, this.hue),
            hue2rgb(p, q, this.hue - 1f / 3f)
        )
    }
}


private fun hue2rgb(p: Float, q: Float, t0: Float): Float {
    var t = t0
    if (t < 0f) t += 1
    if (t > 1f) t -= 1
    if (t < 1f / 6f) return p + (q - p) * 6f * t
    if (t < 1f / 2f) return q
    if (t < 2f / 3f) return p + (q - p) * (2f / 3f - t) * 6f
    return p
}


