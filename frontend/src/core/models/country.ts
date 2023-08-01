import {Color} from "./Color";

export interface Country {
    countryId: string,
    userId: string,
    color: Color,
    availableSettlers: number | null
}
