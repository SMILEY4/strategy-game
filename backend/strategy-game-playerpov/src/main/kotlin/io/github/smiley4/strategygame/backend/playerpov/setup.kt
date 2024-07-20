package io.github.smiley4.strategygame.backend.playerpov
import io.github.smiley4.strategygame.backend.playerpov.edge.PlayerViewCreator
import io.github.smiley4.strategygame.backend.playerpov.module.PlayerViewCreatorImpl
import org.koin.core.module.Module


fun Module.dependenciesPlayerPoV() {
    single<PlayerViewCreator> { PlayerViewCreatorImpl() }
}