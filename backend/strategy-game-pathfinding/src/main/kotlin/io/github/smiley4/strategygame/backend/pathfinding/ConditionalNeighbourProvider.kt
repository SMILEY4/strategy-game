package io.github.smiley4.strategygame.backend.pathfinding


abstract class ConditionalNeighbourProvider<T : Node> : NeighbourProvider<T> {

    private val rules = mutableListOf<NeighbourCondition<T>>()

    fun withConditions(vararg rules: NeighbourCondition<T>): ConditionalNeighbourProvider<T> {
        this.rules.clear()
        this.rules.addAll(rules)
        return this
    }

    override fun getNeighbours(current: T, consumer: (neighbour: T) -> Unit) {
        getNeighbourCandidates(current) { candidate ->
            if (allRulesApply(current, candidate)) {
                consumer(candidate)
            }
        }
    }

    private fun allRulesApply(prev: T, next: T): Boolean {
        return rules.all { it.evaluate(prev, next) }
    }

    abstract fun getNeighbourCandidates(current: T, consumer: (neighbour: T) -> Unit)

}