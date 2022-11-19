package de.ruegnerlukas.strategygame.ecosim.trade

data class TradeNode(
    val name: String,
    val localResourceAvailability: Double,
    var demand: Double = 0.0,
    var tradedAmount: Double = 0.0,
    val sellLog: MutableMap<String, Double> = mutableMapOf(),
    val buyLog: MutableMap<String, Double> = mutableMapOf()
) {

    fun getCurrentBalance() = localResourceAvailability + tradedAmount


    fun sellTo(amount: Double, other: String) {
        tradedAmount -= amount
        sellLog[other] = sellLog[other]?.plus(amount) ?: amount
    }

    fun buyFrom(amount: Double, other: String) {
        tradedAmount += tradedAmount
        buyLog[other] = buyLog[other]?.plus(amount) ?: amount
    }

}