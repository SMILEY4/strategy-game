package io.github.smiley4.strategygame.backend.worldgen.module

import io.github.smiley4.strategygame.backend.common.utils.WeightedCollection
import io.github.smiley4.strategygame.backend.commondata.TerrainResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.TilePosition
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenerator
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenSettings
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldTile
import kotlin.random.Random

class WorldGeneratorImpl : WorldGenerator {

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
        TerrainType.LAND to WeightedCollection<TerrainResourceType>().apply {
            add(0.6, TerrainResourceType.PLAINS)
            add(0.2, TerrainResourceType.FOREST)
            add(0.15, TerrainResourceType.STONE)
            add(0.05, TerrainResourceType.METAL)
        },
        TerrainType.WATER to WeightedCollection<TerrainResourceType>().apply {
            add(0.7, TerrainResourceType.NONE)
            add(0.3, TerrainResourceType.FISH)
        },
        TerrainType.MOUNTAIN to WeightedCollection<TerrainResourceType>().apply {
            add(0.1, TerrainResourceType.NONE)
            add(0.5, TerrainResourceType.STONE)
            add(0.3, TerrainResourceType.METAL)
        }
    )

    private var random = Random(0)

    override fun buildTiles(settings: WorldGenSettings): List<WorldTile> {
        noise.SetSeed(settings.seed)
        random = Random(settings.seed)
        val tilePositions = TilemapPositionsProvider().createHexagon(settings.size)
        return tilePositions.map { buildTileAt(it, settings) }
    }

    private fun buildTileAt(position: TilePosition, settings: WorldGenSettings): WorldTile {
        val height = noise.GetNoise(position.q.toFloat(), position.r.toFloat())
        val terrainType = settings.singleTileType ?: tileTypeAt(height)
        return WorldTile(
            q = position.q,
            r = position.r,
            type = terrainType,
            resource = resourceTypeAt(terrainType)
        )
    }

    private fun tileTypeAt(height: Float): TerrainType {
        return if (height < 0) {
            TerrainType.WATER
        } else if (height > 0.4 && random.nextFloat() > 0.35) {
            TerrainType.MOUNTAIN
        } else {
            TerrainType.LAND
        }
    }

    private fun resourceTypeAt(terrain: TerrainType): TerrainResourceType {
        return resourceConfig[terrain]?.chooseRandom(random) ?: TerrainResourceType.NONE
    }

}