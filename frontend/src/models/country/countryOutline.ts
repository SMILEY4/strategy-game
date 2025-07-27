import {Color} from "../../common/color";
import {CountryId} from "./countryId";

export interface CountryOutline {
	id: CountryId,
	name: string
	color: Color,
	isUserControlled: boolean,
	playerName: string,
}