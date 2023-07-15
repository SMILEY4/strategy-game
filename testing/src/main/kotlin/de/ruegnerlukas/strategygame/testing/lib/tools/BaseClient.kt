package de.ruegnerlukas.strategygame.testing.lib.tools

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.contentType
import io.ktor.serialization.jackson.jackson

class BaseClient {

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            jackson()
        }
    }


    suspend fun get(url: String, block: BaseRequestDsl.() -> Unit): HttpResponse {
        return call(BaseRequest(HttpMethod.Get, url).apply(block))
    }

    suspend fun post(url: String, block: BaseRequestDsl.() -> Unit): HttpResponse {
        return call(BaseRequest(HttpMethod.Post, url).apply(block))
    }

    suspend fun put(url: String, block: BaseRequestDsl.() -> Unit): HttpResponse {
        return call(BaseRequest(HttpMethod.Put, url).apply(block))
    }

    suspend fun delete(url: String, block: BaseRequestDsl.() -> Unit): HttpResponse {
        return call(BaseRequest(HttpMethod.Delete, url).apply(block))
    }

    private suspend fun call(request: BaseRequest): HttpResponse {
        return client.request(request.url) {
            method = request.method
            if (request.getBody() != null && request.getContentType() != null) {
                contentType(request.getContentType()!!)
                setBody(request.getBody())
            }
        }
    }


}

class BaseRequest(method: HttpMethod, url: String) : BaseRequestDsl(method, url) {

    fun getBody() = bodyJson

    fun getContentType(): ContentType? {
        if (bodyJson != null) {
            return ContentType.Application.Json
        }
        return null
    }

}


open class BaseRequestDsl(val method: HttpMethod, val url: String) {

    var bodyJson: Any? = null

}
