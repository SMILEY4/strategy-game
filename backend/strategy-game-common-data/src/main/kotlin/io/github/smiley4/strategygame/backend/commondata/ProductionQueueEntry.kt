package io.github.smiley4.strategygame.backend.commondata


sealed class ProductionQueueEntry(
    val id: Id,
    var progress: Float,
) {

    @JvmInline
    value class Id(val value: String) {
        companion object
    }

    class Settler(
        id: Id,
        progress: Float
    ) : ProductionQueueEntry(id, progress)

}
