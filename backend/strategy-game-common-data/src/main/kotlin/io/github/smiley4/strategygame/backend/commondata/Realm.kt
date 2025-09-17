package io.github.smiley4.strategygame.backend.commondata

import io.github.smiley4.strategygame.backend.commondata.utils.Color

data class Realm(
    val id: Id,
    val color: Color,
    val name: String,
    val user: User.Id,
) {

    @JvmInline
    value class Id(val value: String) {
        companion object
    }

    companion object {
        val COLORS = listOf(
            Color.rgb(255u, 128u, 128u),
            Color.rgb(120u, 156u, 240u),
            Color.rgb(176u, 222u, 111u),
            Color.rgb(204u, 102u, 192u),
            Color.rgb(93u, 186u, 171u),
            Color.rgb(242u, 186u, 121u),
            Color.rgb(142u, 113u, 227u),
            Color.rgb(110u, 209u, 105u),
            Color.rgb(191u, 96u, 128u),
            Color.rgb(124u, 202u, 247u),
        )
    }

}