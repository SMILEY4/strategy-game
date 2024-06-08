//package io.github.smiley4.strategygame.backend.ecosim.ledger
//
//import io.github.smiley4.strategygame.backend.common.detaillog.DetailLog
//import io.github.smiley4.strategygame.backend.common.detaillog.DetailLogValue
//import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
//
//
//class ResourceLedgerEntry(
//    val resourceType: ResourceType,
//    var amount: Float,
//    var missing: Float,
//) : DetailLog() {
//
//    fun add(id: String, amount: Float, data: MutableMap<String,DetailLogValue>) {
//        this.amount += amount
//        this.addDetail(id, data)
//    }
//
//    fun addMissing(id: String, amount: Float, data: MutableMap<String,DetailLogValue>) {
//        this.missing += amount
//        this.addDetail(id, data)
//    }
//
//
//}