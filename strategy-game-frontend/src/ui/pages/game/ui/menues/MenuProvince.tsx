import React, {ReactElement} from "react";
import {useCitiesByProvince} from "../../../../../core/hooks/useCitiesByProvince";
import {useCityById} from "../../../../../core/hooks/useCityById";
import {useProvinceById} from "../../../../../core/hooks/useProvinceById";
import {ResourceType} from "../../../../../core/models/resourceType";
import {AppConfig} from "../../../../../main";
import {ResourceLabel} from "../../../../components/specific/ResourceLabel";
import {Section} from "../../../../components/specific/Section";

export function MenuProvince(props: { provinceId: string }): ReactElement {

    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    const province = useProvinceById(props.provinceId);
    const cities = useCitiesByProvince(province?.provinceId);
    const capitalCity = useCityById(province?.provinceCapitalCityId)

    return (
        <div>
            {!(province && capitalCity) && (
                <h2>Province not found</h2>
            )}
            {(province && capitalCity) && (
                <>
                    <h2>Province</h2>
                    <Section title={"Overview"}>
                        <p>{"Name: " + province?.provinceId}</p>
                        <p className={"clickable"} onClick={() => openCountry(province?.countryId)}>{"Country: " + province.countryId}</p>
                        <p className={"clickable"} onClick={() => openCity(capitalCity?.cityId)}>{"Capital: " + capitalCity.name}</p>
                    </Section>
                    <Section title={"Cities"}>
                        {cities.map(city => {
                            return (
                                <p className={"clickable"} onClick={() => openCity(city.cityId)}>{city.name}</p>
                            );
                        })}
                    </Section>
                    <Section title={"Province Resources"}>
                        <ul>
                            {ResourceType.ALL.map(resourceType => {
                                const amount = province.resources?.get(resourceType) || 0;
                                return (
                                    <li><ResourceLabel type={resourceType} value={amount} showPlusSign={true}/></li>
                                );
                            })}
                        </ul>
                    </Section>
                </>
            )}
        </div>
    );


    function openCountry(countryId: string) {
        uiService.openMenuCountry(countryId);
    }

    function openCity(cityId: string) {
        uiService.openMenuCity(cityId);
    }

}