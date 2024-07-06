package io.github.smiley4.strategygame.backend.worldgen

import io.github.smiley4.strategygame.backend.commondata.TilePosition
import io.github.smiley4.strategygame.backend.worldgen.module.TilemapPositionsProvider
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder

class TilemapPositionsProviderTest : StringSpec({

    "builds correct tilemap of shape 'parallelogram'" {
        TilemapPositionsProvider().createParallelogram(-1, 3, 1, 3).let {
            it shouldContainExactlyInAnyOrder listOf(
                TilePosition(-1, 1),
                TilePosition(-1, 2),
                TilePosition(-1, 3),
                TilePosition(0, 1),
                TilePosition(0, 2),
                TilePosition(0, 3),
                TilePosition(1, 1),
                TilePosition(1, 2),
                TilePosition(1, 3),
                TilePosition(2, 1),
                TilePosition(2, 2),
                TilePosition(2, 3),
                TilePosition(3, 1),
                TilePosition(3, 2),
                TilePosition(3, 3)
            )
        }
    }


    "builds correct tilemap of shape 'triangle type-A'" {
        TilemapPositionsProvider().createTriangleTypeA(4).let {
            it shouldContainExactlyInAnyOrder listOf(
                TilePosition(0, 0),
                TilePosition(0, 1),
                TilePosition(0, 2),
                TilePosition(0, 3),
                TilePosition(1, 0),
                TilePosition(1, 1),
                TilePosition(1, 2),
                TilePosition(2, 0),
                TilePosition(2, 1),
                TilePosition(3, 0)
            )
        }
    }


    "builds correct tilemap of shape 'triangle type-B'" {
        TilemapPositionsProvider().createTriangleTypeB(4).let {
            it shouldContainExactlyInAnyOrder listOf(
                TilePosition(0, 4),
                TilePosition(1, 3),
                TilePosition(1, 4),
                TilePosition(2, 2),
                TilePosition(2, 3),
                TilePosition(2, 4),
                TilePosition(3, 1),
                TilePosition(3, 2),
                TilePosition(3, 3),
                TilePosition(3, 4)
            )
        }
    }


    "builds correct tilemap of shape 'hexagon'" {
        TilemapPositionsProvider().createHexagon(4).let {
            it shouldContainExactlyInAnyOrder listOf(
                TilePosition(-4, 0),
                TilePosition(-4, 1),
                TilePosition(-4, 2),
                TilePosition(-4, 3),
                TilePosition(-4, 4),
                TilePosition(-3, 0),
                TilePosition(-3, 1),
                TilePosition(-3, 2),
                TilePosition(-3, 3),
                TilePosition(-3, 4),
                TilePosition(-2, 0),
                TilePosition(-2, 1),
                TilePosition(-2, 2),
                TilePosition(-2, 3),
                TilePosition(-2, 4),
                TilePosition(-1, 0),
                TilePosition(-1, 1),
                TilePosition(-1, 2),
                TilePosition(-1, 3),
                TilePosition(-1, 4),
                TilePosition(-3, -1),
                TilePosition(-2, -2),
                TilePosition(-2, -1),
                TilePosition(-1, -3),
                TilePosition(-1, -2),
                TilePosition(-1, -1),
                TilePosition(0, -4),
                TilePosition(0, -3),
                TilePosition(0, -2),
                TilePosition(0, -1),
                TilePosition(1, -4),
                TilePosition(1, -3),
                TilePosition(1, -2),
                TilePosition(1, -1),
                TilePosition(2, -4),
                TilePosition(2, -3),
                TilePosition(2, -2),
                TilePosition(2, -1),
                TilePosition(3, -4),
                TilePosition(3, -3),
                TilePosition(3, -2),
                TilePosition(3, -1),
                TilePosition(4, -4),
                TilePosition(4, -3),
                TilePosition(4, -2),
                TilePosition(4, -1),
                TilePosition(0, 0),
                TilePosition(0, 1),
                TilePosition(0, 2),
                TilePosition(0, 3),
                TilePosition(0, 4),
                TilePosition(1, 0),
                TilePosition(1, 1),
                TilePosition(1, 2),
                TilePosition(1, 3),
                TilePosition(2, 0),
                TilePosition(2, 1),
                TilePosition(2, 2),
                TilePosition(3, 0),
                TilePosition(3, 1),
                TilePosition(4, 0)
            )
        }
    }


    "builds correct tilemap of shape 'rectangle' for tiles with pointy top" {
        TilemapPositionsProvider().createRectanglePointyTop(-1, 3, 1, 3).let {
            println(it)
            it shouldContainExactlyInAnyOrder listOf(
                TilePosition(2, -1),
                TilePosition(3, -1),
                TilePosition(4, -1),
                TilePosition(1, 0),
                TilePosition(2, 0),
                TilePosition(3, 0),
                TilePosition(1, 1),
                TilePosition(2, 1),
                TilePosition(3, 1),
                TilePosition(0, 2),
                TilePosition(1, 2),
                TilePosition(2, 2),
                TilePosition(0, 3),
                TilePosition(1, 3),
                TilePosition(2, 3)
            )
        }
    }


    "builds correct tilemap of shape 'rectangle' for tiles with flat top" {
        TilemapPositionsProvider().createRectangleFlatTop(-1, 3, 1, 3).let {
            it shouldContainExactlyInAnyOrder listOf(
                TilePosition(1, -1),
                TilePosition(2, -2),
                TilePosition(2, -1),
                TilePosition(3, -2),
                TilePosition(3, -1),
                TilePosition(1, 0),
                TilePosition(1, 1),
                TilePosition(1, 2),
                TilePosition(1, 3),
                TilePosition(2, 0),
                TilePosition(2, 1),
                TilePosition(2, 2),
                TilePosition(3, 0),
                TilePosition(3, 1),
                TilePosition(3, 2)
            )
        }
    }

})