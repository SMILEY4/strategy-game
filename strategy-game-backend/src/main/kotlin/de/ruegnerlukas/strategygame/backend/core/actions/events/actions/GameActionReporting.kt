package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventWorldPostUpdate
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType

/**
 * For reporting/debugging purposes
 * - triggered by [GameEventWorldPostUpdate]
 * - triggers nothing
 */
class GameActionReporting : GameAction<GameEventWorldPostUpdate>(GameEventWorldPostUpdate.TYPE) {

	private val samples = mutableListOf<Sample>()

	override suspend fun perform(event: GameEventWorldPostUpdate): List<GameEvent> {

		event.game.provinces.forEach { province ->
			ResourceType.values().forEach { resourceType ->
				samples.add(
					Sample(
						turn = event.game.game.turn,
						province = province.provinceId,
						resourceType = resourceType,
						balance = MarketUtils.getResourceBalance(province, resourceType),
						producedLastTurn = province.resourcesProducedPrevTurn[resourceType],
						producedThisTurn = province.resourcesProducedCurrTurn[resourceType],
						consumedThisTurn = province.resourcesConsumedCurrTurn[resourceType],
						missingThisTurn = province.resourcesMissing[resourceType],
					)
				)
			}
		}


		println("")
		println("")
		println("TURN ${event.game.game.turn}")
		println("")

		println("digraph structs {")

		event.game.provinces.forEach { province ->
			val entries = mutableListOf<String>()
			entries.add(province.provinceId)
			MarketUtils.getResourceBalance(province).toList().filter { it.second != 0f }.forEach { (type, balance) ->
				entries.add("${type.name.lowercase()}: ${balance.format(2)}")
			}
			println("    ${province.provinceId} [shape=record label=\"{${entries.joinToString(separator = " | ")}}\"];")
		}

		event.game.provinces.flatMap { it.tradeRoutes }.forEach { route ->
			println(
				"    ${route.srcProvinceId} -> ${route.dstProvinceId} [label=\"${route.resourceType.name.lowercase()}: ${
					route.tradedAmount.format(
						2
					)
				}\"];"
			)
		}

		println("}")

		println("")

		val startTurn = samples.minOfOrNull { it.turn } ?: 0
		val endTurn = samples.maxOfOrNull { it.turn } ?: 0
		val provinces = event.game.provinces.toList()

		ResourceType.values().forEach { resourceType ->
            println("")
			println((listOf(resourceType.name) + provinces.map { it.provinceId }).joinToString(separator = ";"))
			for (turn in startTurn..endTurn) {
				println((listOf(turn.toString()) + provinces.map { getSample(resourceType, it, turn) }.map { it.balance.format(2) }).joinToString(separator = ";"))
			}
		}



		println("")
		println("")

		return listOf()
	}

    private fun getSample(resourceType: ResourceType, province: Province, turn: Int): Sample {
        return samples.find { s -> s.province == province.provinceId && s.turn == turn && s.resourceType == resourceType }!!
    }

	private fun Float.format(digits: Int) = "%.${digits}f".format(this)

}


private data class Sample(
	val turn: Int,
	val province: String,
	val resourceType: ResourceType,
	val balance: Float,
	val producedLastTurn: Float,
	val producedThisTurn: Float,
	val consumedThisTurn: Float,
	val missingThisTurn: Float
)