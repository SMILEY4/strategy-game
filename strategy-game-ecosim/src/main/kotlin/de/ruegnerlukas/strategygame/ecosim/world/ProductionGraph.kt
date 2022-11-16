package de.ruegnerlukas.strategygame.ecosim.world

class ProductionGraph {

    data class Node(
        val building: BuildingType,
        val input: MutableList<BuildingType>,
        val output: MutableList<BuildingType>
    )

    private val nodes = build(BuildingType.values().toList()).toMutableList()

    private fun build(buildings: List<BuildingType>): List<Node> {
        val nodes = mutableListOf<Node>()
        buildings.forEach { building ->
            nodes.add(
                Node(
                    building = building,
                    input = building.input.keys.flatMap { provides(buildings, it) }.toMutableList(),
                    output = building.output.keys.flatMap { requires(buildings, it) }.toMutableList()
                )
            )
        }
        return nodes
    }

    private fun requires(buildings: List<BuildingType>, resource: Resource): List<BuildingType> {
        return buildings.filter { it.input.containsKey(resource) }
    }

    private fun provides(buildings: List<BuildingType>, resource: Resource): List<BuildingType> {
        return buildings.filter { it.output.containsKey(resource) }
    }

    fun getAsDotGraph(): String {
        val relations = mutableSetOf<Pair<BuildingType, BuildingType>>()
        nodes.forEach { node ->
            node.input.forEach { relations.add(it to node.building) }
            node.output.forEach { relations.add(node.building to it) }
        }
        return "digraph G {\n" + relations.joinToString(";\n") { it.first.name + " -> " + it.second } + "\n}"
    }

    fun consume(consumer: (building: BuildingType) -> Unit) {
        nodes.forEach { node ->
            node.input.removeIf { it == node.building }
            node.output.removeIf { it == node.building }
        }
        while (nodes.isNotEmpty()) {
            val node = nodes.find { it.input.isEmpty() }
            if (node != null) {
                nodes.remove(node)
                nodes.forEach { n -> n.input.removeIf { it == node.building } }
                nodes.forEach { n -> n.output.removeIf { it == node.building } }
                consumer(node.building)
            } else {
                break
            }
        }
    }


}