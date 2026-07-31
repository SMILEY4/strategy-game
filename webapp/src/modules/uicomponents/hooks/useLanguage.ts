import {useTranslation} from "react-i18next";
import {getSupportedLanguages} from "@app/i18n/languages.ts";
import {useState} from "react";

type LanguageItem = {
    key: string,
    name: string,
    flag: string
}

export function useLanguage() {

    const {i18n} = useTranslation();

    const languages = getSupportedLanguages(i18n).map(language => ({
        key: language.code,
        name: language.name,
        flag: language.flag,
    }));

    const initialLanguage = languages.find(l => l.key === i18n.language) ?? languages[0];

    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);

    function onSelectLanguage(language: LanguageItem) {
        setSelectedLanguage(language);
        void i18n.changeLanguage(language.key);
    }

    return {
        languages: languages,
        setLanguage: onSelectLanguage,
        selectedLanguage: selectedLanguage,
    };
}