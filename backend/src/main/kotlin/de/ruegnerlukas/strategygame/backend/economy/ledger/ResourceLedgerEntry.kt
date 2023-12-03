//package de.ruegnerlukas.strategygame.backend.economy.ledger
//
//import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
//import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
//import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
//
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