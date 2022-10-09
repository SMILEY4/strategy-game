package de.ruegnerlukas.strategygame.backend.core.world

import de.ruegnerlukas.strategygame.backend.core.world.tilemap.TilePosition
import de.ruegnerlukas.strategygame.backend.core.world.tilemap.TilemapPositionsBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.shared.FastNoiseLite
import java.lang.Double.max
import java.lang.Double.min
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

    private var random = Random(0)

    fun buildTiles(settings: WorldSettings): List<Tile> {
        noise.SetSeed(settings.seed)
        random = Random(settings.seed)
        val tilePositions = TilemapPositionsBuilder().createHexagon(settings.size)
        return tilePositions.map { buildTileAt(it, settings) }
    }

    private fun buildTileAt(position: TilePosition, settings: WorldSettings): Tile {
        return Tile(
            q = position.q,
            r = position.r,
            type = settings.singleTileType ?: tileTypeAt(position)
        )
    }

    private fun tileTypeAt(position: TilePosition): TileType {
        val noiseValue = noise.GetNoise(position.q.toFloat(), position.r.toFloat())
        return if (noiseValue < 0) {
            TileType.WATER
        } else if (noiseValue > 0.4 && random.nextFloat() > 0.35) {
            TileType.MOUNTAIN
        } else {
            TileType.LAND
        }
    }

}