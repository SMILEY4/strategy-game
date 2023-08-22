export namespace MockData {

    const countries = [
        {
            playerName: "SMILEY_4_",
            countryId: "4370345",
            countryName: "Deutschland",
            settlers: 3,
            provinces: [
                {
                    provinceId: "1",
                    provinceName: "Baden-Württemberg",
                    cities: [
                        {
                            cityId: "2",
                            cityName: "Stuttgart",
                            isCountryCapitol: false,
                            isProvinceCapitol: true,
                        },
                        {
                            cityId: "3",
                            cityName: "Heidelberg",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                        },
                    ],
                },
                {
                    provinceId: "4",
                    provinceName: "Bayern",
                    cities: [
                        {
                            cityId: "5",
                            cityName: "München",
                            isCountryCapitol: false,
                            isProvinceCapitol: true,
                        },
                        {
                            cityId: "6",
                            cityName: "Nürnberg",
                            isCountryCapitol: true,
                            isProvinceCapitol: false,

                        },
                        {
                            cityId: "7",
                            cityName: "Augsburg",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                        },
                        {
                            cityId: "8",
                            cityName: "Würzburg",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                        },
                    ],
                },
                {
                    provinceId: "9",
                    provinceName: "Sachsen",
                    cities: [
                        {
                            cityId: "10",
                            cityName: "Dresden",
                            isCountryCapitol: false,
                            isProvinceCapitol: true,
                        },
                        {
                            cityId: "11",
                            cityName: "Leipzig",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                        },
                        {
                            cityId: "12",
                            cityName: "Chemnitz",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                        },
                    ],
                },
            ],
        },
    ];

    export function getCountryData(countryId: string) {
        return countries.find(country => country.countryId === countryId);
    }

    export function getProvinceData(provinceId: string) {
        for (let country of countries) {
            const province = country.provinces.find(province => province.provinceId === provinceId);
            if(province) {
                return {
                    countryName: country.countryName,
                    countryId: country.countryId,
                    ...province,
                };
            }
        }
        throw Error("Province not found: " + provinceId);
    }

    export function getCityData(cityId: string) {
        for (let country of countries) {
            for (let province of country.provinces) {
                const city = province.cities.find(city => city.cityId === cityId);
                if(city) {
                    return {
                        countryName: country.countryName,
                        countryId: country.countryId,
                        provinceName: province.provinceName,
                        provinceId: province.provinceId,
                        ...city,
                    };
                }
            }
        }
        throw Error("city not found: " + cityId);
    }


}