import {SettlementIdentifier} from "./Settlement";
import {Color} from "./color";

export interface Province {
	identifier: ProvinceIdentifier,
	settlements: SettlementIdentifier[]
}

export interface ProvinceIdentifier {
	id: string
	color: Color,
}