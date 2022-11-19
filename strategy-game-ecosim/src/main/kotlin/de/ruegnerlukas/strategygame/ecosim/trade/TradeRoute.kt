package de.ruegnerlukas.strategygame.ecosim.trade

data class TradeRoute(
    val from: TradeNode,
    val to: TradeNode,
    var rating: Pair<Double,Boolean> = 0.0 to false,
)