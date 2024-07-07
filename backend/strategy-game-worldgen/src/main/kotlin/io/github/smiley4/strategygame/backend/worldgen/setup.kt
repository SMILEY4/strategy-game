package io.github.smiley4.strategygame.backend.worldgen
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenerator
import io.github.smiley4.strategygame.backend.worldgen.module.WorldGeneratorImpl
import org.koin.core.module.Module


fun Module.dependenciesWorldGen() {
    single<WorldGenerator> { WorldGeneratorImpl() }
}