import React, {ReactElement} from "react";
import {CgShapeHexagon} from "react-icons/cg";
import {useCountryById} from "../../../../../core/hooks/useCountryById";
import {useCountryPlayer} from "../../../../../core/hooks/useCountryPlayer";
import {useCountryProvinces} from "../../../../../core/hooks/useCountryProvinces";
import {AppConfig} from "../../../../../main";
import {Section} from "../../../../components/specific/Section";

export function CategoryCountry(): ReactElement {
    const playerCountry = useCountryPlayer()
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    return (
        <div onClick={() => uiService.openMenuCountry(playerCountry.countryId)}>
            <CgShapeHexagon/>
        </div>
    );
}

export function MenuCountry(props: { countryId: string }): ReactElement {

    const country = useCountryById(props.countryId);
    const provinces = useCountryProvinces(props.countryId);
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);

    return (
        <div>
            {!country && (
                <h2>Country not found</h2>
            )}
            {country && (
                <>
                    <h2>Country</h2>
                    <p>{"Player: " + country.userId}</p>
                    <Section title={"Provinces"}>
                        {provinces.map(province => {
                            return (
                                <p className={"clickable"} onClick={() => openProvince(province.provinceId)}>{province.provinceId}</p>
                            );
                        })}
                    </Section>
                </>
            )}
        </div>
    );

    function openProvince(provinceId: string) {
        uiService.openMenuProvince(provinceId);
    }


}