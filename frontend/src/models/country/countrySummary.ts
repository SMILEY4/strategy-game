import {Color} from "../../common/color";
import {Country} from "./country";
import {CountryId} from "./countryId";

export interface CountrySummary {
	id: CountryId,
	name: string,
	color: Color,
	isUserControlled: boolean,
	playerName: string,
}

export namespace CountrySummary {

	export function from(country: Country): CountrySummary {
		return {
			id: country.id,
			name: country.name,
			color: country.color,
			isUserControlled: country.isUserControlled,
			playerName: country.player.name,
		};
	}

}