package de.ruegnerlukas.strategygame.backend.external.api.message.handler

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = TestMessage::class),
	JsonSubTypes.Type(value = OtherMessage::class)
)
open class Message<T>(
	val type: String,
	val payload: T
)


@JsonTypeName("test")
class TestMessage(payload: TestMessagePayload) : Message<TestMessagePayload>("test", payload)

class TestMessagePayload(
	val someField: String
)

@JsonTypeName("other")
class OtherMessage(payload: OtherMessagePayload) : Message<OtherMessagePayload>("other", payload)

class OtherMessagePayload(
	val someField: String
)
