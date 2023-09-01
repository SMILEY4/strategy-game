//
// export namespace MockData {
//
//     const countries = [
//         {
//             identifier: {
//                 id: "4370345",
//                 name: "Deutschland",
//             },
//             playerName: "SMILEY_4_",
//             settlers: 3,
//             provinces: [
//                 {
//                     identifier: {
//                         id: "1",
//                         name: "Baden-Württemberg",
//                     },
//                     cities: [
//                         {
//                             identifier: {
//                                 id: "2",
//                                 name: "Stuttgart",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: true,
//                             population: {
//                               size: 3,
//                               progress: Math.random() * 2 - 1
//                             },
//                             resources: [
//                                 {
//                                     name: "Food",
//                                     icon: "/resource_icon_food.png",
//                                     value: +1,
//                                     contributions: [
//                                         {reason: "+5 from Farms", value: 5},
//                                         {reason: "-2 from Cattle Farm", value: -2},
//                                         {reason: "+4 from Cattle Farm", value: 4},
//                                         {reason: "-6 from Population", value: -6}
//                                     ]
//                                 },
//                                 {
//                                     name: "Metal",
//                                     icon: "/resource_icon_metal.png",
//                                     value: -11.784,
//                                     contributions: []
//                                 },
//                                 {
//                                     name: "Stone",
//                                     icon: "/resource_icon_stone.png",
//                                     value: 9.438,
//                                     contributions: []
//                                 },
//                                 {
//                                     name: "Tools",
//                                     icon: "/resource_icon_tools.png",
//                                     value: 0,
//                                     contributions: []
//                                 },
//                             ],
//                             productionQueue: [
//                                 {
//                                     name: "Farm",
//                                     progress: Math.random()
//                                 }
//                             ],
//                             maxContentSlots: 8,
//                             content: [
//                                 {icon: "Woodcutter.png"},
//                                 {icon: "farm.png"},
//                                 {icon: "farm.png"},
//                                 {icon: "Woodcutter.png"},
//                                 {icon: "Woodcutter.png"},
//                                 {icon: "farm.png"}
//                             ]
//                         },
//                         {
//                             identifier: {
//                                 id: "3",
//                                 name: "Heidelberg",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: false,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [
//                                 {
//                                     name: "Mine",
//                                     progress: Math.random()
//                                 }
//                             ],
//                             maxContentSlots: 6,
//                             content: [
//                                 {icon: "Woodcutter.png"},
//                             ]
//                         },
//                     ],
//                 },
//                 {
//                     identifier: {
//                         id: "4",
//                         name: "Bayern",
//                     },
//                     cities: [
//                         {
//                             identifier: {
//                                 id: "5",
//                                 name: "München",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: true,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [],
//                             maxContentSlots: 8,
//                             content: []
//                         },
//                         {
//                             identifier: {
//                                 id: "6",
//                                 name: "Nürnberg",
//                             },
//                             isCountryCapitol: true,
//                             isProvinceCapitol: false,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [],
//                             maxContentSlots: 6,
//                             content: []
//                         },
//                         {
//                             identifier: {
//                                 id: "7",
//                                 name: "Augsburg",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: false,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [],
//                             maxContentSlots: 6,
//                             content: []
//                         },
//                         {
//                             identifier: {
//                                 id: "8",
//                                 name: "Würzburg",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: false,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [],
//                             maxContentSlots: 6,
//                             content: []
//                         },
//                     ],
//                 },
//                 {
//                     identifier: {
//                         id: "9",
//                         name: "Sachsen",
//                     },
//                     cities: [
//                         {
//                             identifier: {
//                                 id: "10",
//                                 name: "Dresden",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: true,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [],
//                             maxContentSlots: 8,
//                             content: []
//                         },
//                         {
//                             identifier: {
//                                 id: "11",
//                                 name: "Leipzig",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: false,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [],
//                             maxContentSlots: 6,
//                             content: []
//                         },
//                         {
//                             identifier: {
//                                 id: "12",
//                                 name: "Chemnitz",
//                             },
//                             isCountryCapitol: false,
//                             isProvinceCapitol: false,
//                             population: {
//                                 size: 3,
//                                 progress: Math.random() * 2 - 1
//                             },
//                             resources: [],
//                             productionQueue: [],
//                             maxContentSlots: 6,
//                             content: []
//                         },
//                     ],
//                 },
//             ],
//         },
//     ];
//
//     export function getCountryData(countryId: string): CountryData {
//         const country = countries.find(country => country.identifier.id === countryId)!!;
//         return {
//             ...country,
//             provinces: country.provinces.map(province => ({
//                 identifier: province.identifier,
//                 country: country.identifier,
//                 cities: province.cities.map(city => ({
//                     identifier: city.identifier,
//                     province: province.identifier,
//                     country: {} as any,
//                     isCountryCapitol: city.isCountryCapitol,
//                     isProvinceCapitol: city.isProvinceCapitol,
//                 })),
//             })),
//         };
//     }
//
//     export function getProvinceData(provinceId: string): ProvinceData {
//         for (let country of countries) {
//             const province = country.provinces.find(province => province.identifier.id === provinceId);
//             if (province) {
//                 return {
//                     ...province,
//                     country: country.identifier,
//                     cities: province.cities.map(city => ({
//                         identifier: city.identifier,
//                         province: province.identifier,
//                         country: {} as any,
//                         isCountryCapitol: city.isCountryCapitol,
//                         isProvinceCapitol: city.isProvinceCapitol,
//                     })),
//                 };
//             }
//         }
//         throw Error("Province not found: " + provinceId);
//     }
//
//     export function getCityData(cityId: string): CityData {
//         for (let country of countries) {
//             for (let province of country.provinces) {
//                 const city = province.cities.find(city => city.identifier.id === cityId);
//                 if (city) {
//                     return {
//                         ...city,
//                         province: province.identifier,
//                         country: country.identifier,
//                     };
//                 }
//             }
//         }
//         throw Error("city not found: " + cityId);
//     }
//
//
// }