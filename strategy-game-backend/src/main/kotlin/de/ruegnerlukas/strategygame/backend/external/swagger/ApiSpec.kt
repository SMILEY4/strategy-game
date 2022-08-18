package de.ruegnerlukas.strategygame.backend.external.swagger

import de.ruegnerlukas.strategygame.backend.shared.Json
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.plugin
import io.ktor.server.auth.AuthenticationRouteSelector
import io.ktor.server.routing.HttpMethodRouteSelector
import io.ktor.server.routing.RootRouteSelector
import io.ktor.server.routing.Route
import io.ktor.server.routing.Routing
import io.ktor.server.routing.TrailingSlashRouteSelector
import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.Operation
import io.swagger.v3.oas.models.PathItem
import io.swagger.v3.oas.models.Paths
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.responses.ApiResponse
import io.swagger.v3.oas.models.responses.ApiResponses
import io.swagger.v3.oas.models.servers.Server

object ApiSpec {

	var jsonSpec: String = ""

	fun build(
		application: Application,
		swaggerUrl: String,
		infoConfig: OpenAPIInfoConfiguration,
		serverConfig: List<OpenAPIServerConfiguration>
	) {
		val openAPI = OpenAPI().apply {
			info = Info().apply {
				title = infoConfig.title
				description = infoConfig.description
				version = infoConfig.version
			}
			servers = serverConfig.map {
				Server().apply {
					url = it.url
					description = it.description
				}
			}
			paths = Paths().apply {
				collectRoutes(application)
					.filter { it.path != swaggerUrl && it.path != "$swaggerUrl/{filename}" }
					.forEach { route ->
						addPathItem(route.path, PathItem().apply {
							val operation = Operation().apply {
								summary = "short summary"
								description = "short description"
								responses = ApiResponses().apply {
									addApiResponse("200", ApiResponse().apply {
										description = "Success Case"
									})
								}
							}
							when (route.method) {
								HttpMethod.Get -> get = operation
								HttpMethod.Post -> post = operation
								HttpMethod.Put -> put = operation
								HttpMethod.Patch -> patch = operation
								HttpMethod.Delete -> delete = operation
								HttpMethod.Head -> head = operation
								HttpMethod.Options -> options = operation
							}
						})
					}
			}
		}
		jsonSpec = Json.asString(openAPI, true)
	}

	data class RouteMeta(
		val path: String,
		val method: HttpMethod
	)

	private fun collectRoutes(application: Application): List<RouteMeta> {
		val routes = allRoutes(application.plugin(Routing))
		return routes.map { route ->
			RouteMeta(
				method = getMethod(route),
				path = getPath(route)
			)
		}
	}


	private fun getMethod(route: Route): HttpMethod {
		return (route.selector as HttpMethodRouteSelector).method
	}

	private fun getPath(route: Route): String {
		return when (route.selector) {
			is TrailingSlashRouteSelector -> "/"
			is RootRouteSelector -> ""
			is HttpMethodRouteSelector -> route.parent?.let { getPath(it) } ?: ""
			is AuthenticationRouteSelector -> route.parent?.let { getPath(it) } ?: ""
			else -> (route.parent?.let { getPath(it) } ?: "") + "/" + route.selector.toString()
		}
	}


	private fun allRoutes(root: Route): List<Route> {
		return (listOf(root) + root.children.flatMap { allRoutes(it) })
			.filter { it.selector is HttpMethodRouteSelector }
	}

}
