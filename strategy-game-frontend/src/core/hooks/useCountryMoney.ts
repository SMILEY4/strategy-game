import {useCountryResources} from "./useCountryResources";

export function useCountryMoney(): number {
    return useCountryResources().money;
}