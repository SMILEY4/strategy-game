package io.github.smiley4.strategygame.engine.simulation.generation

import io.github.smiley4.strategygame.engine.simulation.domain.generation.FastNoiseLite
import io.github.smiley4.strategygame.engine.simulation.gamestate.HexPosition
import io.github.smiley4.strategygame.engine.simulation.gamestate.Tile
import io.github.smiley4.strategygame.engine.simulation.gamestate.distance
import kotlin.collections.map
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.min
import kotlin.random.Random
import kotlin.random.nextInt

/**
 * Generates tile-based game worlds using noise functions with chunk-based organization.
 */
class WorldGenerator {

    private val chunkRadius = 30

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

        val tilePositions = buildTilePositionsWithChunks(radius, chunkRadius)

        val tiles = tilePositions.map { (tilePositions, chunkPosition) ->
            val height = noise.GetNoise(tilePositions.q.toFloat(), tilePositions.r.toFloat())
            Tile(
                id = Tile.Id(),
                position = tilePositions,
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
                    chunk = chunkPosition
                )
            )
        }

        return tiles
    }

    private fun buildTilePositionsWithChunks(mapRadius: Int, chunkRadius: Int): List<Pair<HexPosition, HexPosition>> {
        val chunkPositions = buildChunkPositions(mapRadius, chunkRadius)
        val tilesPositions = buildTilePositions(mapRadius)
        return tilesPositions.map {
            it to findChunk(it, chunkPositions)
        }
    }

    private fun findChunk(tilePosition: HexPosition, chunkPositions: List<HexPosition>): HexPosition  {
        var nearestChunkPosition: HexPosition? = null
        var nearestChunkDistance = Int.MAX_VALUE

        chunkPositions.forEach { chunkPosition ->
            val distance = chunkPosition.distance(tilePosition)
            if(distance < nearestChunkDistance) {
                nearestChunkDistance = distance
                nearestChunkPosition = chunkPosition
            }
        }

        return nearestChunkPosition ?: throw Exception("Could not find chunk position for tile at $tilePosition")
    }

    private fun buildTilePositions(mapRadius: Int): List<HexPosition> {
        return TilemapPositionsProvider().createHexagon(mapRadius)
    }

    private fun buildChunkPositions(mapRadius: Int, chunkRadius: Int): List<HexPosition> {

        val chunkGridRadius = ceil((mapRadius / chunkRadius).toDouble()).toInt()
        val chunks = mutableListOf<HexPosition>()

        for(q in -chunkGridRadius..chunkGridRadius) {
            for(r in -chunkGridRadius..chunkGridRadius) {
                val center = HexPosition(q, r)
                if(maxOf(abs(center.q), abs(center.r), abs(center.s)) > chunkGridRadius) {
                    continue
                }
                chunks.add(center)
            }
        }

        return chunks
    }

}