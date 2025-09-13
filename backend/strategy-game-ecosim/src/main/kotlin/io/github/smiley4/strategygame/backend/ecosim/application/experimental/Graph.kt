package io.github.smiley4.strategygame.backend.ecosim.application.experimental

data class Graph(
    val nodes: List<Node>,
    val edges: List<Edge>
)

data class Node(
    val name: String,
    val storage: Storage
)

data class Edge(
    val a: Node,
    val b: Node,
    val cost: Float
)

data class Storage(
    var produces: Float,
    var consumes: Float,
)