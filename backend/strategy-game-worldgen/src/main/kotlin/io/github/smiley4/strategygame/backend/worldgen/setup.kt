package io.github.smiley4.strategygame.backend.worldgen
import io.github.smiley4.strategygame.backend.worldgen.edge.NameGenerator
import io.github.smiley4.strategygame.backend.worldgen.edge.WorldGenerator
import io.github.smiley4.strategygame.backend.worldgen.module.NameGeneratorImpl
import io.github.smiley4.strategygame.backend.worldgen.module.WorldGeneratorImpl
import org.koin.core.module.Module


fun Module.dependenciesWorldGen() {
    single<WorldGenerator> { WorldGeneratorImpl() }
    single<NameGenerator> { NameGeneratorImpl() }
}