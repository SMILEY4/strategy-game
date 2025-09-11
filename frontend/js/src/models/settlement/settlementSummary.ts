import {Color} from "../../common/color";
import {Settlement} from "./settlement";

export interface SettlementSummary {
	id: string,
	name: string,
	color: Color,
	isUserControlled: boolean,
}

export namespace SettlementSummary {

	export function from(settlement: Settlement): SettlementSummary {
		return {
			id: settlement.id,
			name: settlement.name,
			color: settlement.color,
			isUserControlled: settlement.country.isUserControlled,
		}
	}

}