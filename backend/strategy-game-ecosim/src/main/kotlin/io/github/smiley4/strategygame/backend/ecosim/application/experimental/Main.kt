package io.github.smiley4.strategygame.backend.ecosim.application.experimental


fun main() {

    /*
     * digraph G {
     *     A -> B;
     *     B -> C;
     *     C -> D;
     *     D -> E;
     *     D -> F;
     *     D -> L;
     *     D -> K;
     *     E -> F;
     *     F -> G;
     *     F -> J;
     *     G -> H;
     *     H -> I;
     *     I -> J;
     *     J -> K;
     *     K -> L;
     * }
     * https://dreampuf.github.io/GraphvizOnline/?engine=neato#digraph%20G%20%7B%0A%20%20%20%20A%20-%3E%20B%3B%0A%20%20%20%20B%20-%3E%20C%3B%0A%20%20%20%20C%20-%3E%20D%3B%0A%20%20%20%20D%20-%3E%20E%3B%0A%20%20%20%20D%20-%3E%20F%3B%0A%20%20%20%20D%20-%3E%20L%3B%0A%20%20%20%20D%20-%3E%20K%3B%0A%20%20%20%20E%20-%3E%20F%3B%0A%20%20%20%20F%20-%3E%20G%3B%0A%20%20%20%20F%20-%3E%20J%3B%0A%20%20%20%20G%20-%3E%20H%3B%0A%20%20%20%20H%20-%3E%20I%3B%0A%20%20%20%20I%20-%3E%20J%3B%0A%20%20%20%20J%20-%3E%20K%3B%0A%20%20%20%20K%20-%3E%20L%3B%0A%7D
     */
    val nodeA = Node("A", Storage(0F, 0F))
    val nodeB = Node("B", Storage(0F, 0F))
    val nodeC = Node("C", Storage(0F, 0F))
    val nodeD = Node("D", Storage(0F, 0F))
    val nodeE = Node("E", Storage(0F, 0F))
    val nodeF = Node("F", Storage(0F, 0F))
    val nodeG = Node("G", Storage(0F, 0F))
    val nodeH = Node("H", Storage(0F, 0F))
    val nodeI = Node("I", Storage(0F, 0F))
    val nodeJ = Node("J", Storage(0F, 0F))
    val nodeK = Node("K", Storage(0F, 0F))
    val nodeL = Node("L", Storage(0F, 0F))

    val nodes = listOf(
        nodeA,
        nodeB,
        nodeC,
        nodeD,
        nodeE,
        nodeF,
        nodeG,
        nodeH,
        nodeI,
        nodeJ,
        nodeK,
        nodeL,
    )

    val edges = listOf(
        Edge(nodeA, nodeB, 1f),
        Edge(nodeB, nodeC, 1f),
        Edge(nodeC, nodeD, 1f),
        Edge(nodeD, nodeE, 1f),
        Edge(nodeD, nodeF, 1f),
        Edge(nodeD, nodeL, 1f),
        Edge(nodeD, nodeK, 1f),
        Edge(nodeE, nodeF, 1f),
        Edge(nodeF, nodeG, 1f),
        Edge(nodeF, nodeJ, 1f),
        Edge(nodeG, nodeH, 1f),
        Edge(nodeH, nodeI, 1f),
        Edge(nodeI, nodeJ, 1f),
        Edge(nodeJ, nodeK, 1f),
        Edge(nodeK, nodeL, 1f),
    ) + nodes.map { Edge(it, it, 0.01f) }

    val graph = Graph(nodes, edges)


    nodeA.storage.produces += 7
    nodeE.storage.produces += 4
    nodeH.storage.produces += 3
    nodeJ.storage.produces += 4 // 18

    nodeA.storage.consumes += 2
    nodeB.storage.consumes += 3
    nodeD.storage.consumes += 8
    nodeG.storage.consumes += 2
    nodeK.storage.consumes += 4 // 17


    val trades = TradeSystem.generateTrades(graph)

    trades.forEach { trade ->
        println(" - ${trade.producer.name} -> ${trade.consumer.name}: ${trade.amount}  (${trade.path.joinToString(",") {it.name}})")

    }

}


