package de.ruegnerlukas.strategygame.backend.shared

class ResultStatus(val successful: Boolean, val status: String) {

	companion object {
		fun successful(status: String = ""): ResultStatus {
			return ResultStatus(true, status)
		}

		fun failed(status: String = ""): ResultStatus {
			return ResultStatus(false, status)
		}
	}

}