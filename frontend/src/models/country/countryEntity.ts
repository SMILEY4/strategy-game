import {Color} from "../../common/color";
import {Player} from "../misc/player";
import {CountryId} from "./countryId";

export interface CountryEntity {
	id: CountryId,
	name: string
	color: Color,
	isUserControlled: boolean,
	player: Player,
}