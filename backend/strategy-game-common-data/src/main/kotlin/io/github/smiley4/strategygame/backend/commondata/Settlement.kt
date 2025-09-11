package io.github.smiley4.strategygame.backend.commondata


class Settlement(
    val id: Id,
    val country: Country.Id,
    val tile: TileRef,
    val attributes: Attributes,
    val infrastructure: Infrastructure,
    val population: Population,
    var resourceLedger: ResourceLedger
) {

    @JvmInline
    value class Id(val value: String) {
        companion object
    }

    class Attributes(
        val name: String,
        val color: RGBColor,
        val viewDistance: Int,
    )

    class Infrastructure(
        val productionQueue: MutableList<ProductionQueueEntry>,
        val buildings: MutableList<Building>,
    )

    class Population(
        var size: Int,
        var growthProgress: Float,
        var growthAmount: Float,
        val growthDetails: MutableMap<String, Float> = mutableMapOf(),
    )

}
