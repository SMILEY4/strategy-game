package io.github.smiley4.strategygame.backend.commondata

data class Province(
    val provinceId: String,
    val settlementIds: MutableSet<String>,
    val color: RGBColor
)
