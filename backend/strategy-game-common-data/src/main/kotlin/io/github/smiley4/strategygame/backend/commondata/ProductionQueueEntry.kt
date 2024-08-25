package io.github.smiley4.strategygame.backend.commondata


sealed class ProductionQueueEntry(
    val entryId: String,
    var progress: Float,
) {

    class Settler(
        entryId: String,
        progress: Float
    ) : ProductionQueueEntry(entryId, progress)

}
