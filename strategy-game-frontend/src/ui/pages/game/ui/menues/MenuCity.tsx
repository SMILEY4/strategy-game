import React, {ReactElement} from "react";
import {useCityById} from "../../../../../core/hooks/useCityById";
import {useCountryById} from "../../../../../core/hooks/useCountryById";
import {useProvinceByCity} from "../../../../../core/hooks/useProvinceByCity";
import {useValidateCreateBuilding} from "../../../../../core/hooks/useValidateCreateBuilding";
import {BuildingType} from "../../../../../core/models/buildingType";
import {ResourceType} from "../../../../../core/models/resourceType";
import {AppConfig} from "../../../../../main";
import {AdvButton} from "../../../../components/specific/AdvButton";
import {ResourceLabel} from "../../../../components/specific/ResourceLabel";
import {Section} from "../../../../components/specific/Section";
import "./menuCity.css"

export function MenuCity(props: { cityId: string }): ReactElement {

    const city = useCityById(props.cityId)
    const province = useProvinceByCity(city?.cityId)
    const country = useCountryById(city?.countryId)
    const provinceCapital = useCityById(province?.provinceCapitalCityId)
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    const validateCreateBuilding = useValidateCreateBuilding(city);
    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);

    return (
        <div>
            {!(city && province && country && provinceCapital) && (
                <h2>City not found</h2>
            )}
            {(city && province && country && provinceCapital) && (
                <>
                    <h2>City</h2>
                    <p>{"Name: " + city.name}</p>

                    <Section title={"Overview"}>
                        <p className={"clickable"} onClick={() => openCountry(country?.countryId)}>{"Country: " + country?.countryId}</p>
                        <p className={"clickable"} onClick={() => openProvince(province?.provinceId)}>{"Province: " + province.provinceId}</p>
                        <p className={"clickable"} onClick={() => openCity(provinceCapital?.cityId)}>{"City: " + provinceCapital.name}</p>
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

                    <Section title={"Buildings"}>
                        <ul>
                            {city.buildings.map(building => {
                                const active = building.active
                                const displayName = BuildingType.toDisplayString(building.type);
                                const consumes = BuildingType.consumes(building.type);
                                const produces = BuildingType.produces(building.type);
                                return (
                                    <li className={active ? "" : "li-disabled"}>
                                        <b>{displayName}</b>
                                        {consumes.map(e => <ResourceLabel type={e.type} value={-e.amount} showPlusSign={true}/>)}
                                        {produces.map(e => <ResourceLabel type={e.type} value={+e.amount} showPlusSign={true}/>)}
                                    </li>
                                );
                            })}
                        </ul>
                        {BuildingType.ALL.map(buildingType => {
                            const displayName = BuildingType.toDisplayString(buildingType);
                            const consumes = BuildingType.consumes(buildingType);
                            const produces = BuildingType.produces(buildingType);
                            return (
                                <AdvButton
                                    label={"Add " + displayName}
                                    actionCosts={[]}
                                    turnCosts={[
                                        ...consumes.map(e => ({type: e.type, value: -e.amount})),
                                        ...produces.map(e => ({type: e.type, value: e.amount}))
                                    ]}
                                    disabled={!validateCreateBuilding(buildingType)}
                                    onClick={() => createBuilding(buildingType)}
                                />
                            );
                        })}
                    </Section>

                </>
            )}
        </div>
    );

    function createBuilding(type: BuildingType) {
        if (city) {
            actionAddCommand.addCreateBuilding(city.cityId, type);
        }
    }

    function openCountry(countryId: string) {
        uiService.openMenuCountry(countryId);
    }

    function openProvince(provinceId: string) {
        uiService.openMenuProvince(provinceId);
    }

    function openCity(cityId: string) {
        uiService.openMenuCity(cityId);
    }

}