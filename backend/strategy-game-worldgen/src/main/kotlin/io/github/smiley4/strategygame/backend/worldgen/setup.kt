package io.github.smiley4.strategygame.backend.worldgen
import io.github.smiley4.strategygame.backend.worldgen.ports.provided.NameGenerator
import io.github.smiley4.strategygame.backend.worldgen.ports.provided.WorldGenerator
import io.github.smiley4.strategygame.backend.worldgen.application.NameGeneratorImpl
import io.github.smiley4.strategygame.backend.worldgen.application.WorldGeneratorImpl
import org.koin.core.module.Module


fun Module.dependenciesWorldGen() {
    single<WorldGenerator> { WorldGeneratorImpl() }
    single<NameGenerator> { NameGeneratorImpl() }
}