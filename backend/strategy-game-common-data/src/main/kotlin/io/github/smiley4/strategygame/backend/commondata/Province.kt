package io.github.smiley4.strategygame.backend.commondata

data class Province(
    val id: Id,
    val settlements: MutableSet<Settlement.Id>,
    val color: RGBColor
) {
    @JvmInline
    value class Id(val value: String) {
        companion object {}
    }
}
