import {Color} from "../../common/color";
import {Player} from "../misc/player";
import {CountryId} from "./countryId";

export interface Country {
	id: CountryId,
	name: string
	color: Color,
	isUserControlled: boolean,
	player: Player,
}