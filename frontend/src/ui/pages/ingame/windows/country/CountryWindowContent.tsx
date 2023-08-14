import {ReactElement} from "react";
import "./countryWindowContent.css";

export interface CountryWindowContentProps {
    countryId: string,
    name: string
    settlers: number | null,
    provinces: ({
        id: string,
        name: string,
        cities: ({
            id: string,
            name: string,
        })[]
    })[]
}

export function CountryWindowContent(props: CountryWindowContentProps): ReactElement {
    return (
        <>
            <div className="country-content__title">
                <h1>{props.name}</h1>
                <h1>{"#" + props.countryId}</h1>
            </div>

            <div className="country-content__general">
                <div>{"Settlers: " + (props.settlers === null ? "?" : props.settlers)}</div>
            </div>


            <div className="country-content__provinces">

                {props.provinces.map(province => (
                        <div className="country-content__province">
                            <div className="country-content__province__title">
                                <h2>{province.name}</h2>
                                <h2>{"#" + province.id}</h2>
                            </div>
                            <div className="country-content__province__cities">
                                {province.cities.map(city => (
                                    <div className="country-content__province__city">
                                        <h2>{city.name}</h2>
                                        <h2>{"#" + city.id}</h2>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ),
                )}
            </div>
        </>
    );
}