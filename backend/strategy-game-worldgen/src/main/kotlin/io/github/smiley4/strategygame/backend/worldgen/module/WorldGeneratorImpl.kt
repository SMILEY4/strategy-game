package io.github.smiley4.strategygame.backend.worldgen.module

import io.github.smiley4.strategygame.backend.common.utils.WeightedCollection
import io.github.smiley4.strategygame.backend.commondata.TileResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.TilePosition
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenerator
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenTile
import kotlin.random.Random

internal class WorldGeneratorImpl : WorldGenerator {

    private val noise = FastNoiseLite().apply {
        this.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2)
        this.SetFrequency(0.05f)
        this.SetFractalType(FastNoiseLite.FractalType.FBm)
        this.SetFractalOctaves(6)
        this.SetFractalLacunarity(2.0f)
        this.SetFractalGain(0.6f)
        this.SetFractalWeightedStrength(0.2f)
    }

    private val resourceConfig = mapOf(
        TerrainType.LAND to WeightedCollection<TileResourceType>().apply {
            add(0.6, TileResourceType.NONE)
            add(0.2, TileResourceType.WOOD)
            add(0.15, TileResourceType.STONE)
            add(0.05, TileResourceType.METAL)
        },
        TerrainType.WATER to WeightedCollection<TileResourceType>().apply {
            add(0.7, TileResourceType.NONE)
            add(0.3, TileResourceType.FISH)
        },
    )

    private var random = Random(0)

    override fun buildTiles(settings: WorldGenSettings): List<WorldGenTile> {
        noise.SetSeed(settings.seed)
        random = Random(settings.seed)
        val tilePositions = TilemapPositionsProvider().createHexagon(settings.size)
        return tilePositions.map { buildTileAt(it, settings) }
    }

    private fun buildTileAt(position: TilePosition, settings: WorldGenSettings): WorldGenTile {
        val height = noise.GetNoise(position.q.toFloat(), position.r.toFloat())
        val terrainType = settings.singleTileType ?: tileTypeAt(height)
        return WorldGenTile(
            q = position.q,
            r = position.r,
            height = height,
            type = terrainType,
            resource = resourceTypeAt(terrainType)
        )
    }

    private fun tileTypeAt(height: Float): TerrainType {
        return if (height > 0) {
            TerrainType.LAND
        } else {
            TerrainType.WATER
        }
    }

    private fun resourceTypeAt(terrain: TerrainType): TileResourceType {
        return resourceConfig[terrain]?.chooseRandom(random) ?: TileResourceType.NONE
    }

}