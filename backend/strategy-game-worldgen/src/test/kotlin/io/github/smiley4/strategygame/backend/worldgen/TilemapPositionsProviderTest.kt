package io.github.smiley4.strategygame.backend.worldgen

import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.worldgen.application.TilemapPositionsProvider
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder

class TilemapPositionsProviderTest : StringSpec({

    "builds correct tilemap of shape 'parallelogram'" {
        TilemapPositionsProvider().createParallelogram(-1, 3, 1, 3).let {
            it shouldContainExactlyInAnyOrder listOf(
                Tile.Position(-1, 1),
                Tile.Position(-1, 2),
                Tile.Position(-1, 3),
                Tile.Position(0, 1),
                Tile.Position(0, 2),
                Tile.Position(0, 3),
                Tile.Position(1, 1),
                Tile.Position(1, 2),
                Tile.Position(1, 3),
                Tile.Position(2, 1),
                Tile.Position(2, 2),
                Tile.Position(2, 3),
                Tile.Position(3, 1),
                Tile.Position(3, 2),
                Tile.Position(3, 3)
            )
        }
    }


    "builds correct tilemap of shape 'triangle type-A'" {
        TilemapPositionsProvider().createTriangleTypeA(4).let {
            it shouldContainExactlyInAnyOrder listOf(
                Tile.Position(0, 0),
                Tile.Position(0, 1),
                Tile.Position(0, 2),
                Tile.Position(0, 3),
                Tile.Position(1, 0),
                Tile.Position(1, 1),
                Tile.Position(1, 2),
                Tile.Position(2, 0),
                Tile.Position(2, 1),
                Tile.Position(3, 0)
            )
        }
    }


    "builds correct tilemap of shape 'triangle type-B'" {
        TilemapPositionsProvider().createTriangleTypeB(4).let {
            it shouldContainExactlyInAnyOrder listOf(
                Tile.Position(0, 4),
                Tile.Position(1, 3),
                Tile.Position(1, 4),
                Tile.Position(2, 2),
                Tile.Position(2, 3),
                Tile.Position(2, 4),
                Tile.Position(3, 1),
                Tile.Position(3, 2),
                Tile.Position(3, 3),
                Tile.Position(3, 4)
            )
        }
    }


    "builds correct tilemap of shape 'hexagon'" {
        TilemapPositionsProvider().createHexagon(4).let {
            it shouldContainExactlyInAnyOrder listOf(
                Tile.Position(-4, 0),
                Tile.Position(-4, 1),
                Tile.Position(-4, 2),
                Tile.Position(-4, 3),
                Tile.Position(-4, 4),
                Tile.Position(-3, 0),
                Tile.Position(-3, 1),
                Tile.Position(-3, 2),
                Tile.Position(-3, 3),
                Tile.Position(-3, 4),
                Tile.Position(-2, 0),
                Tile.Position(-2, 1),
                Tile.Position(-2, 2),
                Tile.Position(-2, 3),
                Tile.Position(-2, 4),
                Tile.Position(-1, 0),
                Tile.Position(-1, 1),
                Tile.Position(-1, 2),
                Tile.Position(-1, 3),
                Tile.Position(-1, 4),
                Tile.Position(-3, -1),
                Tile.Position(-2, -2),
                Tile.Position(-2, -1),
                Tile.Position(-1, -3),
                Tile.Position(-1, -2),
                Tile.Position(-1, -1),
                Tile.Position(0, -4),
                Tile.Position(0, -3),
                Tile.Position(0, -2),
                Tile.Position(0, -1),
                Tile.Position(1, -4),
                Tile.Position(1, -3),
                Tile.Position(1, -2),
                Tile.Position(1, -1),
                Tile.Position(2, -4),
                Tile.Position(2, -3),
                Tile.Position(2, -2),
                Tile.Position(2, -1),
                Tile.Position(3, -4),
                Tile.Position(3, -3),
                Tile.Position(3, -2),
                Tile.Position(3, -1),
                Tile.Position(4, -4),
                Tile.Position(4, -3),
                Tile.Position(4, -2),
                Tile.Position(4, -1),
                Tile.Position(0, 0),
                Tile.Position(0, 1),
                Tile.Position(0, 2),
                Tile.Position(0, 3),
                Tile.Position(0, 4),
                Tile.Position(1, 0),
                Tile.Position(1, 1),
                Tile.Position(1, 2),
                Tile.Position(1, 3),
                Tile.Position(2, 0),
                Tile.Position(2, 1),
                Tile.Position(2, 2),
                Tile.Position(3, 0),
                Tile.Position(3, 1),
                Tile.Position(4, 0)
            )
        }
    }


    "builds correct tilemap of shape 'rectangle' for tiles with pointy top" {
        TilemapPositionsProvider().createRectanglePointyTop(-1, 3, 1, 3).let {
            println(it)
            it shouldContainExactlyInAnyOrder listOf(
                Tile.Position(2, -1),
                Tile.Position(3, -1),
                Tile.Position(4, -1),
                Tile.Position(1, 0),
                Tile.Position(2, 0),
                Tile.Position(3, 0),
                Tile.Position(1, 1),
                Tile.Position(2, 1),
                Tile.Position(3, 1),
                Tile.Position(0, 2),
                Tile.Position(1, 2),
                Tile.Position(2, 2),
                Tile.Position(0, 3),
                Tile.Position(1, 3),
                Tile.Position(2, 3)
            )
        }
    }


    "builds correct tilemap of shape 'rectangle' for tiles with flat top" {
        TilemapPositionsProvider().createRectangleFlatTop(-1, 3, 1, 3).let {
            it shouldContainExactlyInAnyOrder listOf(
                Tile.Position(1, -1),
                Tile.Position(2, -2),
                Tile.Position(2, -1),
                Tile.Position(3, -2),
                Tile.Position(3, -1),
                Tile.Position(1, 0),
                Tile.Position(1, 1),
                Tile.Position(1, 2),
                Tile.Position(1, 3),
                Tile.Position(2, 0),
                Tile.Position(2, 1),
                Tile.Position(2, 2),
                Tile.Position(3, 0),
                Tile.Position(3, 1),
                Tile.Position(3, 2)
            )
        }
    }

})