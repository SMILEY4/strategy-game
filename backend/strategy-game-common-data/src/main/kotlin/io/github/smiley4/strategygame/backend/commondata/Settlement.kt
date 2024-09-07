package io.github.smiley4.strategygame.backend.commondata


class Settlement(
    val id: Id,
    val country: Country.Id,
    val tile: TileRef,
    val attributes: Attributes,
    val infrastructure: Infrastructure,
) {

    @JvmInline
    value class Id(val value: String) {
        companion object {}
    }


    class Infrastructure(
        val productionQueue: MutableList<ProductionQueueEntry>,
        val buildings: MutableList<Building>,
    )

    class Attributes(
        val name: String,
        val color: RGBColor,
        val viewDistance: Int,
    )

    fun findProvince(game: GameExtended): Province = game.findProvinceBySettlement(id)

}
