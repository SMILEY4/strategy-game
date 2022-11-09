package de.ruegnerlukas.strategygame.ecosim.simulation.actions

import de.ruegnerlukas.strategygame.ecosim.simulation.SimAction
import de.ruegnerlukas.strategygame.ecosim.simulation.SimContext
import de.ruegnerlukas.strategygame.ecosim.simulation.Simulation
import de.ruegnerlukas.strategygame.ecosim.utils.FastNoiseLite
import java.lang.Math.random
import kotlin.math.max
import kotlin.math.min

private val noise = FastNoiseLite().apply {
    this.SetNoiseType(FastNoiseLite.NoiseType.OpenSimplex2)
    this.SetFrequency(0.025f)
    this.SetFractalType(FastNoiseLite.FractalType.FBm)
    this.SetFractalOctaves(4)
    this.SetFractalLacunarity(2.0f)
    this.SetFractalGain(0.6f)
    this.SetFractalWeightedStrength(0.2f)
}

class ActionAgricultureEfficiency(simulation: Simulation) : SimAction(simulation) {

    override fun execute(simContext: SimContext) {
        simContext.world.agricultureEfficiency = 1f + noise.GetNoise(simContext.tick.toFloat(), 0f) * 0.5f
    }

}