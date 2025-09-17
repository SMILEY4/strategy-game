package io.github.smiley4.strategygame.backend.playerpov

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.commondata.Realm
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObjectComponent
import io.github.smiley4.strategygame.backend.playerpov.application.TileVisibilityDTO

internal class VisibilityCalculator {

    fun calculate(gameState: GameState, povRealm: Realm.Id, tile: Tile): TileVisibilityDTO {
        if (povRealm.notContainedIn(tile.discoveredBy)) {
            return TileVisibilityDTO.UNKNOWN
        }
        if(hasLineOfSight(gameState, povRealm, tile)) {
            return TileVisibilityDTO.VISIBLE
        }
        return TileVisibilityDTO.DISCOVERED
    }

    private fun hasLineOfSight(gameState: GameState, povRealm: Realm.Id, tile: Tile): Boolean {
        return gameState
            .worldObjects
            .asSequence()
            .filter { it.realm == povRealm }
            .filter { it.hasComponent<WorldObjectComponent.Vision>() }
            .any { tile.position.distance(it.tile) <= it.getComponent<WorldObjectComponent.Vision>().radius }
    }

}