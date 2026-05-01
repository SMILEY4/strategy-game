package io.github.smiley4.strategygame.platform.match

import io.github.smiley4.ktoropenapi.route
import io.github.smiley4.strategygame.platform.match.domain.GameEngineClient
import io.github.smiley4.strategygame.platform.match.domain.MatchRepository
import io.github.smiley4.strategygame.platform.match.domain.MatchServiceImpl
import io.github.smiley4.strategygame.platform.match.infrastructure.GameEngineClientImpl
import io.github.smiley4.strategygame.platform.match.infrastructure.InMemoryMatchRepository
import io.github.smiley4.strategygame.platform.match.routing.routeCreateMatch
import io.github.smiley4.strategygame.platform.match.routing.routeDeleteMatch
import io.github.smiley4.strategygame.platform.match.routing.routeGenerateMatch
import io.github.smiley4.strategygame.platform.match.routing.routeJoinMatch
import io.github.smiley4.strategygame.platform.match.routing.routeListMatches
import io.ktor.server.routing.Route
import org.koin.core.module.Module

fun Module.dependenciesPlatform() {
    single<GameEngineClient> { GameEngineClientImpl() }
    single<MatchRepository> { InMemoryMatchRepository() }
    single<MatchService> { MatchServiceImpl(get(), get()) }
}

fun Route.routingPlatform() {
    route("platform", {
        description = "Match handling"
        tags("platform")
    }) {
        routeCreateMatch() // todo: pull url and Http-operation out of route function and define here
        routeDeleteMatch()
        routeGenerateMatch()
        routeJoinMatch()
        routeListMatches()
    }
}