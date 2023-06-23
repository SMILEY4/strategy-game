package de.ruegnerlukas.strategygame.backend.common.events


sealed class EventResult<T>(val data: T?) {

    companion object {
        fun <T> ok() = OkEventResult(null as T)
        fun <T> ok(data: T) = OkEventResult(data)
        fun <T> error() = ErrorEventResult<T>()
        fun <T> cancel() = CancelEventResult<T>()
    }

}


class OkEventResult<T>(data: T) : EventResult<T>(data)

class CancelEventResult<T> : EventResult<T>(null)

class ErrorEventResult<T> : EventResult<T>(null)