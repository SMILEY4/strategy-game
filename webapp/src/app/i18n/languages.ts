import i18n from "i18next";

export interface Language {
    code: string,
    name: string,
    flag: string,
}

export function getSupportedLanguages(instance: typeof i18n): Language[] {
    const languageCodes = ((instance.options.supportedLngs as string[] | undefined) ?? []).filter(l => l !== "cimode");
    return languageCodes.map(code => ({
        code: code,
        name: getLanguageName(code),
        flag: getLanguageFlag(code),
    }));
}

function getLanguageName(code: string): string {
    return new Intl.DisplayNames(code, {type: "language"}).of(code) ?? code;
}

function getLanguageFlag(code: string): string {
    try {
        const region = new Intl.Locale(code).maximize().region;
        if (!region || region.length !== 2) return "";
        return String.fromCodePoint(
            ...region.split("").map(c => 0x1F1E6 + c.charCodeAt(0) - 65),
        );
    } catch {
        return "";
    }
}