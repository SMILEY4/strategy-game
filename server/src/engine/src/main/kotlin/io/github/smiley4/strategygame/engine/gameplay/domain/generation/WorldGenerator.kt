package io.github.smiley4.strategygame.engine.gameplay.domain.generation

import io.github.smiley4.strategygame.engine.gameplay.domain.gamestate.Tile
import kotlin.random.Random

class WorldGenerator {

    private val noise = FastNoiseLite().apply {
        this.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2)
        this.SetFrequency(0.05f)
        this.SetFractalType(FastNoiseLite.FractalType.FBm)
        this.SetFractalOctaves(6)
        this.SetFractalLacunarity(2.0f)
        this.SetFractalGain(0.6f)
        this.SetFractalWeightedStrength(0.2f)
    }


    fun generate(radius: Int, seed: Int): List<Tile> {

        noise.SetSeed(seed)
        val random = Random(seed)
        val tilePositions = TilemapPositionsProvider().createHexagon(radius)
        val tiles = tilePositions.map {
            Tile(
                position = it
            )
        }

        return tiles
    }


}