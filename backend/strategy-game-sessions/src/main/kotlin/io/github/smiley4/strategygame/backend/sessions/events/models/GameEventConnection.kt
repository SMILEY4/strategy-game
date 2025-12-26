package io.github.smiley4.strategygame.backend.sessions.events.models

import io.github.smiley4.ktorplus.data.Connection
import io.github.smiley4.ktorplus.data.Principal
import io.github.smiley4.strategygame.backend.common.auth.WsTokenPrincipal

@Connection
data class GameEventConnection(
    @Principal val principal: WsTokenPrincipal,
)