package de.ruegnerlukas.strategygame.backend.pathfinding.routebased

import de.ruegnerlukas.strategygame.backend.common.models.Route


class RouteBasedPathfinder {

	fun find(startCityId: String, endCityId: String, routes: Collection<Route>): List<Route> {

		val scores = mutableMapOf<String, Float>()
		val prevNodes = mutableMapOf<String, Pair<String, Route>>()
		val open = mutableSetOf<String>()

		open.add(startCityId)
		scores[startCityId] = 0f

		while (open.isNotEmpty()) {
			val current = open.sortedBy { scores[it] }.first()
			open.remove(current)

			if (current == endCityId) {
				return tracePath(endCityId, prevNodes)

			} else {
				getNeighbours(current, routes).forEach { (neighbour, route) ->

					val prevScore = scores[neighbour]
					val nextScore = scores[current]!! + route.path.size

					if (prevScore == null || prevScore > nextScore) {
						scores[neighbour] = scores[current]!! + nextScore
						open.add(neighbour)
						prevNodes[neighbour] = current to route
					}

				}
			}

		}

		return listOf()
	}


	private fun getNeighbours(node: String, routes: Collection<Route>): List<Pair<String, Route>> {
		return routes
			.filter { it.cityIdA == node || it.cityIdB == node }
			.map {
				(if (it.cityIdA == node) {
					it.cityIdB
				} else {
					it.cityIdA
				}) to it
			}
	}

	private fun tracePath(end: String, prevNodes: Map<String, Pair<String, Route>>): List<Route> {
		val path = mutableListOf<Route>()
		var current: String? = end
		while (current != null) {
			val prev = prevNodes[current]
			if (prev != null) {
				path.add(prev.second)
				current = prev.first
			} else {
				current = null
			}
		}
		return path
	}


}