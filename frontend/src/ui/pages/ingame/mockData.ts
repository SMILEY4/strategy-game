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
                            resources: [
                                {
                                    icon: "/resource_icon_food.png",
                                    value: -4.345
                                },
                                {
                                    icon: "/resource_icon_metal.png",
                                    value: +11.784
                                },
                                {
                                    icon: "/resource_icon_stone.png",
                                    value: 9.438
                                },
                                {
                                    icon: "/resource_icon_tools.png",
                                    value: 0
                                }
                            ]
                        },
                        {
                            cityId: "3",
                            cityName: "Heidelberg",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                            resources: []
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
                            resources: []
                        },
                        {
                            cityId: "6",
                            cityName: "Nürnberg",
                            isCountryCapitol: true,
                            isProvinceCapitol: false,
                            resources: []

                        },
                        {
                            cityId: "7",
                            cityName: "Augsburg",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                            resources: []
                        },
                        {
                            cityId: "8",
                            cityName: "Würzburg",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                            resources: []
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
                            resources: []
                        },
                        {
                            cityId: "11",
                            cityName: "Leipzig",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                            resources: []
                        },
                        {
                            cityId: "12",
                            cityName: "Chemnitz",
                            isCountryCapitol: false,
                            isProvinceCapitol: false,
                            resources: []
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