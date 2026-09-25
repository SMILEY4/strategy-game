package io.github.smiley4.strategygame.engine.simulation


internal data class GameSettings(
    val worldGenerationSettings: WorldGenerationSettings = WorldGenerationSettings(),
    val tileImprovementRequiredControl: Float = 0.000000001f,
    val settlementRequiredControl: Float = 0.000000001f,
    val visionRequiredControl: Float = 5f,
    val territoryClaimControlThreshold: Float = 3f,
    val territoryLooseControlThreshold: Float = 1f
)

internal data class WorldGenerationSettings(
    val chunkRadius: Int = 30,
    val worldRadius: Int = 50,
    val spawnRadius: Int = 3,
    val maxAttemptsHighQualitySpawn: Int = 5,
    val maxAttemptsLowQualitySpawn: Int = 5,
)