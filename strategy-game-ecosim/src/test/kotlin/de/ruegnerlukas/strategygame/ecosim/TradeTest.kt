package de.ruegnerlukas.strategygame.ecosim

import de.ruegnerlukas.strategygame.ecosim.trade.TradeNetwork
import de.ruegnerlukas.strategygame.ecosim.trade.TradeNode
import de.ruegnerlukas.strategygame.ecosim.trade.TradeRoute
import de.ruegnerlukas.strategygame.ecosim.trade.TradeSystem
import io.kotest.core.spec.style.StringSpec

class TradeTest : StringSpec({
    "test" {

        val nodeA = TradeNode("A", 11.0)
        val nodeB = TradeNode("B", 19.0)
        val nodeC = TradeNode("C", 17.0)
        val nodeD = TradeNode("D", -13.0)
        val nodeE = TradeNode("E", 20.0)
        val nodeF = TradeNode("F", +5.0)
        val nodeG = TradeNode("G", -16.0)
        val nodeH = TradeNode("H", 12.0)
        val nodeI = TradeNode("I", 2.0)
        val nodeJ = TradeNode("J", 0.0)
        val nodeK = TradeNode("K", 6.0)
        val nodeL = TradeNode("L", 11.0)
        val nodeM = TradeNode("M", -3.0)
        val nodeN = TradeNode("N", +7.0)
        val nodeO = TradeNode("O", 1.0)
        val nodeP = TradeNode("P", 3.0)

        val network = TradeNetwork(
            nodes = listOf(nodeA, nodeB, nodeC, nodeD, nodeE, nodeF, nodeG, nodeH, nodeI, nodeJ, nodeK, nodeL, nodeM, nodeN, nodeO, nodeP),
            routes = listOf(
                TradeRoute(nodeA, nodeC), TradeRoute(nodeC, nodeA),
                TradeRoute(nodeB, nodeC), TradeRoute(nodeC, nodeB),
                TradeRoute(nodeC, nodeD), TradeRoute(nodeD, nodeC),
                TradeRoute(nodeD, nodeE), TradeRoute(nodeE, nodeD),
                TradeRoute(nodeD, nodeF), TradeRoute(nodeF, nodeD),
                TradeRoute(nodeJ, nodeF), TradeRoute(nodeF, nodeJ),
                TradeRoute(nodeI, nodeF), TradeRoute(nodeF, nodeI),
                TradeRoute(nodeH, nodeF), TradeRoute(nodeF, nodeH),
                TradeRoute(nodeJ, nodeI), TradeRoute(nodeI, nodeJ),
                TradeRoute(nodeI, nodeH), TradeRoute(nodeH, nodeI),
                TradeRoute(nodeE, nodeG), TradeRoute(nodeG, nodeE),
                TradeRoute(nodeE, nodeH), TradeRoute(nodeH, nodeE),
                TradeRoute(nodeG, nodeL), TradeRoute(nodeL, nodeG),
                TradeRoute(nodeH, nodeL), TradeRoute(nodeL, nodeH),
                TradeRoute(nodeH, nodeK), TradeRoute(nodeK, nodeH),
                TradeRoute(nodeK, nodeL), TradeRoute(nodeL, nodeK),
                TradeRoute(nodeP, nodeK), TradeRoute(nodeK, nodeP),
                TradeRoute(nodeL, nodeM), TradeRoute(nodeM, nodeL),
                TradeRoute(nodeL, nodeN), TradeRoute(nodeN, nodeL),
                TradeRoute(nodeN, nodeO), TradeRoute(nodeO, nodeN),
            )
        )

        val system = TradeSystem(network)
        system.updateTradeNodesDemand()

        println()
        println(network.asDotGraph())
        println()

        println()
        println("TRADE ROUTES")
        system.generatePrimaryTradeRoutes().forEach { route ->
            println("${route.from.name} -> ${route.to.name}[color=blue,label=\"${route.tradeAmount}\"];")
        }
        println("NODES OUTCOME")
        network.nodes.forEach { node ->
            println("${node.name}:  ${node.localResourceAvailability} -> ${node.getCurrentBalance()}       (${node.tradedAmount})")
//            if (node.buyLog.isNotEmpty()) {
//                println("  Buy from")
//                node.buyLog.forEach { (other, amount) -> println("    - $other $amount") }
//            }
//            if (node.sellLog.isNotEmpty()) {
//                println("  Sell to")
//                node.sellLog.forEach { (other, amount) -> println("    - $other $amount") }
//            }
        }
        println()



        println()
        println(network.asDotGraph())
        println()

    }
})


