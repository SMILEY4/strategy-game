package io.github.smiley4.strategygame.engine.simulation.generation

import io.github.smiley4.strategygame.shared.values.UserId

internal data class GenerationContext(
    val players: Set<UserId>
)