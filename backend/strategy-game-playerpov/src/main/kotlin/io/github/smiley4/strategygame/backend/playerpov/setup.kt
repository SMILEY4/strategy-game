package io.github.smiley4.strategygame.backend.playerpov
import io.github.smiley4.strategygame.backend.playerpov.lib.PlayerViewCreator
import io.github.smiley4.strategygame.backend.playerpov.application.PlayerViewCreatorImpl
import org.koin.core.module.Module


fun Module.dependenciesPlayerPoV() {
    single<PlayerViewCreator> { PlayerViewCreatorImpl(get(), get()) }
}