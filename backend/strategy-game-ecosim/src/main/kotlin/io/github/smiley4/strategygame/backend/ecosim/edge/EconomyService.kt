package io.github.smiley4.strategygame.backend.ecosim.edge

interface EconomyService {
    fun update(root: EconomyNode): EconomyReport
}