package de.ruegnerlukas.strategygame.backend.external.swagger

import io.ktor.server.application.ApplicationCall
import io.ktor.server.routing.Route
import io.ktor.server.routing.RouteSelector
import io.ktor.server.routing.RouteSelectorEvaluation
import io.ktor.server.routing.RoutingResolveContext
import io.ktor.server.routing.post
import io.ktor.util.pipeline.PipelineContext
import io.ktor.util.pipeline.PipelineInterceptor

class DocumentedRouteSelector(
	val documentation: RouteDocumentation
) : RouteSelector() {
	override fun evaluate(context: RoutingResolveContext, segmentIndex: Int) = RouteSelectorEvaluation.Transparent
}


fun Route.documentation(
	documentation: RouteDocumentation.() -> Unit = { },
	build: Route.() -> Unit
): Route {
	val documentedRoute = createChild(DocumentedRouteSelector(RouteDocumentation().apply(documentation)))
	documentedRoute.build()
	return documentedRoute
}


inline fun <reified R : Any> Route.docuPost(
	path: String,
	noinline builder: RouteDocumentation.() -> Unit = { },
	crossinline body: suspend PipelineContext<Unit, ApplicationCall>.(R) -> Unit
): Route {
	return documentation(builder) { post(path, body) }
}


fun Route.post(
	path: String,
	builder: RouteDocumentation.() -> Unit = { },
	body: PipelineInterceptor<Unit, ApplicationCall>
): Route {
	return documentation(builder) { post(path, body) }
}


@JvmName("postTyped")
inline fun <reified R : Any> Route.post(
	noinline builder: RouteDocumentation.() -> Unit = { },
	crossinline body: suspend PipelineContext<Unit, ApplicationCall>.(R) -> Unit
): Route {
	return documentation(builder) { post(body) }
}


@JvmName("postTypedPath")
inline fun <reified R : Any> Route.post(
	path: String,
	noinline builder: RouteDocumentation.() -> Unit = { },
	crossinline body: suspend PipelineContext<Unit, ApplicationCall>.(R) -> Unit
): Route {
	return documentation(builder) { post(path, body) }
}

fun Route.post(
	builder: RouteDocumentation.() -> Unit = { },
	body: PipelineInterceptor<Unit, ApplicationCall>
): Route {
	return documentation(builder) { post(body) }
}



