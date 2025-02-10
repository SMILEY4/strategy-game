export namespace NumberFormatter {

    export interface Config {
        // determines whether value should be classified "neutral", "good" or "bad"
        behaviour: "neutral" | "less-is-better" | "more-is-better",
        referencePoint: number,

        // determines when to a "+" or "-"
        signBehaviour: "always" | "never" | "minus-only"
        zeroClassification: "neutral" | "positive" | "negative"

        // determines general format of the given number
        decimalPlaces: number,

        // suffix to append after the number
        suffix?: string,
    }

    export interface Result {
        value: string,
        classification: "neutral" | "good" | "bad"
    }

    export function format(value: number, config: Config): Result {

        // apply decimal places
        const d = Math.pow(10, config.decimalPlaces);
        const preparedValue = Math.abs(Math.round(value * d) / d);
        let strValue = "" + preparedValue;

        // apply sign
        const signConfig = buildSignConfig(config);
        if (value < 0) strValue = signConfig.negative + strValue;
        if (value == 0) strValue = signConfig.zero + strValue;
        if (value > 0) strValue = signConfig.positive + strValue;

        // apply suffix
        if(config.suffix) {
            strValue = strValue + config.suffix
        }

        // determine classification (good / bad / neutral)
        const classification = classify(value, config)

        console.log(value, classification, config, strValue)

        return {
            value: strValue,
            classification: classification,
        };
    }

    function classify(value: number, config: Config): "neutral" | "good" | "bad" {
        if (config.behaviour === "neutral") return "neutral";

        if (value < config.referencePoint) {
            if (config.behaviour === "less-is-better") return "good";
            if (config.behaviour === "more-is-better") return "bad";
        }
        if (value === config.referencePoint) {
            if (config.zeroClassification === "neutral") {
                return "neutral";
            }
            if (config.zeroClassification === "positive") {
                if (config.behaviour === "less-is-better") return "bad";
                if (config.behaviour === "more-is-better") return "good";

            }
            if (config.zeroClassification === "negative") {
                if (config.behaviour === "less-is-better") return "good";
                if (config.behaviour === "more-is-better") return "bad";
            }
        }
        if (value > config.referencePoint) {
            if (config.behaviour === "less-is-better") return "bad";
            if (config.behaviour === "more-is-better") return "good";
        }

        throw new Error("Invalid classification configuration");
    }

    interface SignConfig {
        negative: "+" | "-" | ""
        zero: "+" | "-" | "",
        positive: "+" | "-" | "",
    }

    function buildSignConfig(config: Config): SignConfig {
        if (config.signBehaviour === "never") {
            return {
                negative: "",
                zero: "",
                positive: "",
            };
        }
        if (config.signBehaviour === "always") {
            if (config.zeroClassification === "neutral") {
                return {
                    negative: "-",
                    zero: "",
                    positive: "+",
                };
            }
            if (config.zeroClassification === "positive") {
                return {
                    negative: "-",
                    zero: "+",
                    positive: "+",
                };
            }
            if (config.zeroClassification === "negative") {
                return {
                    negative: "-",
                    zero: "-",
                    positive: "+",
                };
            }
        }
        if (config.signBehaviour === "minus-only") {
            if (config.zeroClassification === "negative") {
                return {
                    negative: "-",
                    zero: "-",
                    positive: "",
                };
            } else {
                return {
                    negative: "-",
                    zero: "",
                    positive: "",
                };
            }
        }

        throw new Error("Invalid sign configuration");
    }

}