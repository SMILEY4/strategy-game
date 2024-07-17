package io.github.smiley4.strategygame.backend.engine.module.core.tools

object GameRules {

    fun isValidSettlementName(name: String): Boolean {
        return name.isNotBlank()
    }

}