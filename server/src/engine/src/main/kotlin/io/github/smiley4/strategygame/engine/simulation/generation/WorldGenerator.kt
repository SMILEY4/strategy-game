package io.github.smiley4.strategygame.engine.simulation.generation

import io.github.smiley4.strategygame.engine.simulation.domain.generation.FastNoiseLite
import io.github.smiley4.strategygame.engine.simulation.domain.generation.TilemapPositionsProvider
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import kotlin.random.Random
import kotlin.random.nextInt

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
            val height = noise.GetNoise(it.q.toFloat(), it.r.toFloat())
            Tile(
                id = Tile.Id(),
                position = it,
                world = Tile.WorldData(
                    biome = if (height < 0) Tile.Biome.OCEAN
                    else Tile.Biome.entries.filter { b -> b != Tile.Biome.OCEAN }[random.nextInt(Tile.Biome.entries.size - 1)],
                    elevation = Tile.Elevation.entries[random.nextInt(Tile.Elevation.entries.size)],
                    feature = (Tile.Feature.entries + listOf(null))[random.nextInt(Tile.Feature.entries.size + 1)],
                    resources = (1..random.nextInt(1..3)).map {
                        Tile.ResourceDeposit(
                            type = Tile.Resource.entries[random.nextInt(Tile.Resource.entries.size)],
                            amount = 100f,
                            maxAmount = 100f,
                            changeRate = 1f,
                            removeOnDeplete = false
                        )
                    },
                ),
                meta = Tile.Metadata(
                    seed = random.nextInt(),
                    chunkQ = 0,
                    chunkR = 0
                )
            )
        }

        return tiles
    }


}