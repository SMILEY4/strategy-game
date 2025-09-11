package io.github.smiley4.strategygame.backend.ecosim.lib

interface EconomyService {
    fun update(root: EconomyNode): EconomyReport
}