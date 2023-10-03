import {Country} from "../../../_old_core/models/country";


export class CountryContainer {

    private readonly elements: Country[];
    private readonly indexByCountryId = new Map<string, number>();
    private readonly indexByUserIdId = new Map<string, number>();

    constructor(countries: Country[]) {
        this.elements = countries;
        this.elements.forEach((country, index) => {
            this.indexByCountryId.set(country.countryId, index);
            this.indexByUserIdId.set(country.userId, index);
        });
    }

    all(): Country[] {
        return this.elements;
    }

    byUserId(userId: string | null): Country | null {
        const index = userId ? this.indexByUserIdId.get(userId) : -1;
        return this.byIndex(index);
    }

    byCountryId(countryId: string | null): Country | null {
        const index = countryId ? this.indexByCountryId.get(countryId) : -1;
        return this.byIndex(index);
    }

    private byIndex(index: number | undefined | null): Country | null {
        return index !== undefined && index !== null && index >= 0 ? this.elements[index] : null;
    }


}