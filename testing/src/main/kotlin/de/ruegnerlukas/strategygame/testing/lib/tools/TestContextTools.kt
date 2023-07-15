package de.ruegnerlukas.strategygame.testing.lib.tools

import de.ruegnerlukas.strategygame.testing.lib.tools.models.LoginRequestData
import io.ktor.client.statement.HttpResponse

open class TestContextTools {

    private val client = BaseClient()

    val api = GenericApi(client)
    val user = UserApi(client)

}

class GenericApi(private val client: BaseClient) {

    suspend fun get(url: String, block: BaseRequestDsl.() -> Unit) = client.get(url, block)

    suspend fun post(url: String, block: BaseRequestDsl.() -> Unit) = client.post(url, block)

    suspend fun put(url: String, block: BaseRequestDsl.() -> Unit) = client.put(url, block)

    suspend fun delete(url: String, block: BaseRequestDsl.() -> Unit) = client.delete(url, block)


}


class UserApi(private val client: BaseClient) {

    suspend fun login(email: String, password: String): HttpResponse {
        return client.post("http://localhost:8080/api/user/login") {
            bodyJson = LoginRequestData(
                email = email,
                password = password
            )
        }
    }

}