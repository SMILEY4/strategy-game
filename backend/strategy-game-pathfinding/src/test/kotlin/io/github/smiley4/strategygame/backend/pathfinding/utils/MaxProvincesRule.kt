package io.github.smiley4.strategygame.backend.pathfinding.utils

/**
 * The path can not cross more than the given max amount of different provinces (Unclaimed tiles are not counted)
 */
class MaxProvincesRule(private val maxProvinces: Int) : NextNodeRule<TestNode> {

    override fun evaluate(prev: TestNode, next: TestNode): Boolean {
        val enterNewProvince = next.tile.owner?.provinceId
            ?.let { !prev.visitedProvinces.contains(it) }
            ?: false
        return if(enterNewProvince) {
            prev.visitedProvinces.size+1 <= maxProvinces
        } else {
            true
        }
    }

}