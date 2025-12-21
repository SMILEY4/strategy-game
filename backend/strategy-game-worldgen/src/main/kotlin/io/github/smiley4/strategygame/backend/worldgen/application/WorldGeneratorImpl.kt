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

    private val resourceConfig = mapOf(
        TerrainType.LAND to WeightedCollection<ResourceType>().apply {
            add(0.6, ResourceType.NONE)
            add(0.2, ResourceType.WOOD)
            add(0.15, ResourceType.STONE)
            add(0.05, ResourceType.METAL)
        },
        TerrainType.WATER to WeightedCollection<ResourceType>().apply {
            add(0.7, ResourceType.NONE)
            add(0.3, ResourceType.FISH)
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
        return when (resourceTypeAt(terrain)) {
            ResourceType.NONE -> emptyList()
            ResourceType.WOOD -> listOf(
                ResourceNode(
                    type = ResourceType.WOOD,
                    amount = 100.0,
                    maxAmount = 100.0,
                    changeRate = 1.0,
                    canDeplete = false
                )
            )
            ResourceType.FISH -> listOf(
                ResourceNode(
                    type = ResourceType.FISH,
                    amount = 100.0,
                    maxAmount = 100.0,
                    changeRate = 1.0,
                    canDeplete = false
                )
            )
            ResourceType.STONE -> listOf(
                ResourceNode(
                    type = ResourceType.STONE,
                    amount = 100.0,
                    maxAmount = 100.0,
                    changeRate = 1.0,
                    canDeplete = false
                )
            )
            ResourceType.METAL -> listOf(
                ResourceNode(
                    type = ResourceType.METAL,
                    amount = 100.0,
                    maxAmount = 100.0,
                    changeRate = 1.0,
                    canDeplete = false
                )
            )
        }
    }

    private fun resourceTypeAt(terrain: TerrainType): ResourceType {
        return resourceConfig[terrain]?.chooseRandom(random) ?: ResourceType.NONE
    }

}