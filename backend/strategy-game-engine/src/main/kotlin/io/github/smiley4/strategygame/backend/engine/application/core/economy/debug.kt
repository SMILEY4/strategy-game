package io.github.smiley4.strategygame.backend.engine.application.core.economy

import io.github.rchowell.dotlin.DotEdgeStyle
import io.github.rchowell.dotlin.DotNodeShape
import io.github.rchowell.dotlin.digraph
import io.github.smiley4.strategygame.backend.commondata.BasicResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.lib.ConsumptionReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.collectEntities
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode.Companion.collectNodes
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyReport
import io.github.smiley4.strategygame.backend.ecosim.lib.MissingResourcesReportEntry
import io.github.smiley4.strategygame.backend.ecosim.lib.ProductionReportEntry
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.GameEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.GameEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.NetworkEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.SettlementEconomyNode
import io.github.smiley4.strategygame.backend.engine.application.core.economy.node.WorldEconomyNode


@OptIn(ExperimentalStdlibApi::class)
fun drawGraph(root: EconomyNode, report: EconomyReport): String {
    return digraph {

        root.collectNodes().forEach { node ->
            +node.hashCode().toHexString().quote() + {
                label = formatNode(node)
                color = "darkslategray2"
                style = "filled"
            }
        }

        root.collectEntities().forEach { entity ->
            +entity.hashCode().toHexString().quote() + {
                label = formatEntity(entity)
                color = "darksalmon"
                style = "filled"
            }
        }

        root.iterate(null) { parent, current ->
            val from = when (parent) {
                is GameEconomyNode -> parent.hashCode().toHexString()
                else -> "?"
            }
            val to = when (current) {
                is GameEconomyNode -> current.hashCode().toHexString()
                is GameEconomyEntity -> current.hashCode().toHexString()
                else -> "?"
            }
            if (parent != null) {
                from.quote() - to.quote()
            }
        }

        report.getEntries().forEach { entry ->
            val strEntry = entry.hashCode().toHexString().quote()
            val strEntity = entry.entity.hashCode().toHexString().quote()
            when (entry) {
                is ConsumptionReportEntry -> {
                    if (entry.resources.isNotZero()) {
                        val strFromNode = entry.fromNode.hashCode().toHexString().quote()
                        +strEntry + {
                            shape = DotNodeShape.RECTANGLE
                            label = buildString {
                                appendLine("CONSUMPTION")
                                entry.resources.toStacks(false).forEach { stack ->
                                    appendLine("${stack.type}:${stack.amount}")
                                }
                            }
                        }
                        strEntity - strEntry + {
                            style = DotEdgeStyle.DOTTED

                        }
                        strFromNode - strEntry
                    }
                }
                is ProductionReportEntry -> {
                    if (entry.resources.isNotZero()) {
                        val strInNode = entry.inNode.hashCode().toHexString().quote()
                        +strEntry + {
                            shape = DotNodeShape.RECTANGLE
                            label = buildString {
                                appendLine("PRODUCTION")
                                entry.resources.toStacks(false).forEach { stack ->
                                    appendLine("${stack.type}:${stack.amount}")
                                }
                            }
                        }
                        strEntity - strEntry + {
                            style = DotEdgeStyle.DOTTED
                        }
                        strInNode - strEntry
                    }
                }
                is MissingResourcesReportEntry -> {
                    if (entry.resources.isNotZero()) {
                        +strEntry + {
                            shape = DotNodeShape.RECTANGLE
                            label = buildString {
                                appendLine("MISSING")
                                entry.resources.toStacks(false).forEach { stack ->
                                    appendLine("${stack.type}:${stack.amount}")
                                }
                            }
                        }
                        strEntity - strEntry + {
                            style = DotEdgeStyle.DOTTED
                        }
                    }
                }
            }
        }

    }.dot()
}

fun EconomyReport.toCsv(): String {

    return buildString {
        appendLine("type;entity;owner;node;resources")
        getEntries().forEach { entry ->
            when (entry) {
                is ConsumptionReportEntry -> {
                    appendLine(
                        "consumption;${formatEntity(entry.entity)};${formatNode(entry.entity.owner)};${formatNode(entry.fromNode)};${
                            formatResources(
                                entry.resources
                            )
                        }"
                    )
                }
                is ProductionReportEntry -> {
                    appendLine(
                        "production;${formatEntity(entry.entity)};${formatNode(entry.entity.owner)};${formatNode(entry.inNode)};${
                            formatResources(
                                entry.resources
                            )
                        }"
                    )
                }
                is MissingResourcesReportEntry -> {
                    appendLine("missing;${formatEntity(entry.entity)};${formatNode(entry.entity.owner)};-;${formatResources(entry.resources)}")
                }
            }
        }
    }
}

private fun formatEntity(entity: EconomyEntity) = when (entity) {
    is GameEconomyEntity -> entity.detailKey()
    else -> "unknown"
}

private fun formatNode(node: EconomyNode) =
    if (node is GameEconomyNode) {
        when (node) {
            is NetworkEconomyNode -> "NetworkEconomyNode"
            is SettlementEconomyNode -> "SettlementEconomyNode(${node.settlement.attributes.name})"
            is WorldEconomyNode -> "WorldEconomyNode"
        }
    } else "?"

private fun formatResources(resources: ResourceCollection) =
    if (resources is BasicResourceCollection) resources.toDebugString().replace(System.lineSeparator(), ",")
    else "resources"

private fun String.quote() = "\"$this\""

private fun EconomyNode.iterate(parent: Any? = null, callback: (parent: Any?, current: Any) -> Unit) {
    callback(parent, this)
    this.entities.forEach { callback(this, it) }
    this.children.forEach { it.iterate(this, callback) }
}