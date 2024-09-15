package io.github.smiley4.strategygame.backend.commondata


data class Country(
    val id: Id,
    val user: User.Id,
    val color: RGBColor,
) {
    @JvmInline
    value class Id(val value: String) {
        companion object
    }
}
