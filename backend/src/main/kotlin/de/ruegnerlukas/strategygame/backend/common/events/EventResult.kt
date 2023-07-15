package de.ruegnerlukas.strategygame.backend.common.events


sealed class EventResult<T>(val data: T?) {

    companion object {
        fun <T> ok(data: T) = OkEventResult(data)
        fun <T> error(data: T) = ErrorEventResult(data)
        fun <T> cancel(data: T) = CancelEventResult(data)
    }

}


class OkEventResult<T>(data: T) : EventResult<T>(data)

class CancelEventResult<T>(data: T) : EventResult<T>(data)

class ErrorEventResult<T>(data: T) : EventResult<T>(data)