package io.github.smiley4.strategygame.backend.commondata.utils

sealed interface Color {

    val redByte: UByte
    val redFloat: Float

    val greenByte: UByte
    val greenFloat: Float

    val blueByte: UByte
    val blueFloat: Float

    fun toRgbByte(): RgbByteColor

    companion object {

        fun rgb(red: UByte, green: UByte, blue: UByte) = RgbByteColor(red, green, blue)

        val BLACK = rgb(0u, 0u, 0u)

    }

}

class RgbByteColor(
    val red: UByte,
    val green: UByte,
    val blue: UByte
) : Color {

    override val redByte: UByte
        get() = red

    override val redFloat: Float
        get() = red.toFloat() / 255.0f

    override val greenByte: UByte
        get() = green

    override val greenFloat: Float
        get() = green.toFloat() / 255.0f

    override val blueByte: UByte
        get() = blue

    override val blueFloat: Float
        get() = blue.toFloat() / 255.0f

    override fun toRgbByte() = this
}