package io.github.smiley4.strategygame.backend.worldgen.application

import io.github.smiley4.strategygame.backend.common.utils.WeightedCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceNode
import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.worldgen.lib.WorldGenSettings
import io.github.smiley4.strategygame.backend.worldgen.lib.WorldGenTile
import io.github.smiley4.strategygame.backend.worldgen.lib.WorldGenerator
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

    private val resourceAmountsConfig = WeightedCollection<Int>().apply {
        add(0.6, 0)
        add(0.3, 1)
        add(0.1, 2)
    }

    private val resourceConfig = mapOf(
        TerrainType.LAND to WeightedCollection<ResourceType>().apply {
            add(0.5, ResourceType.WOOD)
            add(0.375, ResourceType.STONE)
            add(0.125, ResourceType.METAL)
        },
        TerrainType.WATER to WeightedCollection<ResourceType>().apply {
            add(1.0, ResourceType.FISH)
        },
    )

    private var random = Random(0)

    override fun buildTiles(settings: WorldGenSettings): List<WorldGenTile> {
        noise.SetSeed(settings.seed)
        random = Random(settings.seed)
        val tilePositions = TilemapPositionsProvider().createHexagon(settings.size)
        return tilePositions.map { buildTileAt(it, settings) }
    }

    private fun buildTileAt(position: Tile.Position, settings: WorldGenSettings): WorldGenTile {
        val height = noise.GetNoise(position.q.toFloat(), position.r.toFloat())
        val terrainType = settings.singleTileType ?: tileTypeAt(height)
        return WorldGenTile(
            q = position.q,
            r = position.r,
            height = height,
            type = terrainType,
            resources = resourcesAt(terrainType)
        )
    }

    private fun tileTypeAt(height: Float): TerrainType {
        return if (height > 0) {
            TerrainType.LAND
        } else {
            TerrainType.WATER
        }
    }

    private fun resourcesAt(terrain: TerrainType): List<ResourceNode> {
        val amount = resourceAmountsConfig.chooseRandom(random)
        return buildList {
            for (i in 1..amount) {
                add(
                    ResourceNode(
                        type = resourceTypeAt(terrain),
                        amount = 100.0,
                        maxAmount = 100.0,
                        changeRate = 1.0,
                        canDeplete = false
                    )
                )
            }
        }
    }

    private fun resourceTypeAt(terrain: TerrainType): ResourceType {
        return resourceConfig[terrain]?.chooseRandom(random) ?: throw Exception("Failed to choose resource type.")
    }

}