package de.ruegnerlukas.strategygame.backend.shared.logviewer

import com.fasterxml.jackson.databind.ObjectMapper
import kotlinx.html.HTML
import kotlinx.html.ScriptType
import kotlinx.html.body
import kotlinx.html.head
import kotlinx.html.id
import kotlinx.html.link
import kotlinx.html.script
import kotlinx.html.style
import kotlinx.html.table
import kotlinx.html.tbody
import kotlinx.html.td
import kotlinx.html.th
import kotlinx.html.thead
import kotlinx.html.tr
import kotlinx.html.unsafe
import java.io.File

class LogViewer {

    private val objectMapper = ObjectMapper()

    fun build(html: HTML) {
        val logLines = File("log/strategy-game-backend.log").readLines()
        val logEntries = logLines.map { LogEntry(objectMapper, it) }
        html.head {
            link(rel = "stylesheet", href = "./../jstable.css")
            script(src = "./../jstable.min.js") {}
            script(type = ScriptType.textJavaScript) {
                unsafe {
                    raw("window.onload  = () => new JSTable(\"#content\", {perPageSelect: [10, 20, 50, 100, 200, 500]});")
                }
            }
            style {
                unsafe {
                    raw("table { font-family: monospace; }")
                }
            }
        }
        html.body {
            table {
                id = "content"
                thead {
                    tr {
                        th { +"timestamp" }
                        th { +"traceId" }
                        th { +"message" }
                    }
                }
                tbody {
                    logEntries.forEach { logEntry ->
                        tr {
                            td { +logEntry.get("@timestamp") }
                            td { +logEntry.get("traceId") }
                            td { +logEntry.get("message") }
                        }
                    }
                }
            }
        }
    }


}

