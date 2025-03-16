import {Color} from "../../common/color";
import {Player} from "../misc/player";
import {CountryId} from "./countryId";

export interface CountryOutline {
	id: CountryId,
	name: string
	color: Color,
	isUserControlled: boolean,
	playerName: string,
}