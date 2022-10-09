package de.ruegnerlukas.strategygame.backend.core.world

import de.ruegnerlukas.strategygame.backend.core.world.tilemap.TilePosition
import de.ruegnerlukas.strategygame.backend.core.world.tilemap.TilemapPositionsBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.shared.FastNoiseLite
import de.ruegnerlukas.strategygame.backend.shared.WeightedCollection
import kotlin.random.Random

class WorldBuilder {

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
        TileType.LAND to WeightedCollection<TileResourceType>().apply {
            add(0.6, TileResourceType.NONE)
            add(0.2, TileResourceType.FOREST)
            add(0.15, TileResourceType.STONE)
            add(0.05, TileResourceType.METAL)
        },
        TileType.WATER to WeightedCollection<TileResourceType>().apply {
            add(0.7, TileResourceType.NONE)
            add(0.3, TileResourceType.FISH)
        },
        TileType.MOUNTAIN to WeightedCollection<TileResourceType>().apply {
            add(0.1, TileResourceType.NONE)
            add(0.5, TileResourceType.STONE)
            add(0.3, TileResourceType.METAL)
        }
    )

    private var random = Random(0)

    fun buildTiles(settings: WorldSettings): List<Tile> {
        noise.SetSeed(settings.seed)
        random = Random(settings.seed)
        val tilePositions = TilemapPositionsBuilder().createHexagon(settings.size)
        return tilePositions.map { buildTileAt(it, settings) }
    }

    private fun buildTileAt(position: TilePosition, settings: WorldSettings): Tile {
        val height = noise.GetNoise(position.q.toFloat(), position.r.toFloat())
        val terrainType = settings.singleTileType ?: tileTypeAt(height)
        return Tile(
            q = position.q,
            r = position.r,
            type = terrainType,
            resource = resourceTypeAt(terrainType)
        )
    }

    private fun tileTypeAt(height: Float): TileType {
        return if (height < 0) {
            TileType.WATER
        } else if (height > 0.4 && random.nextFloat() > 0.35) {
            TileType.MOUNTAIN
        } else {
            TileType.LAND
        }
    }

    private fun resourceTypeAt(terrain: TileType): TileResourceType {
        return resourceConfig[terrain]?.chooseRandom(random) ?: TileResourceType.NONE
    }

}