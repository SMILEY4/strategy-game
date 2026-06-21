import {defineConfig} from "i18next-cli";

export default defineConfig({
    locales: [
        "_descriptions",
        "en",
        "de",
    ],
    extract: {
        input: "src/**/*.{js,jsx,ts,tsx}",
        output: "public/locales/{{language}}/{{namespace}}.json",
    },
    types: {
        input: ['public/locales/_descriptions/*.json'],
        output: 'src/app/i18n/i18next.d.ts',
        resourcesFile: 'src/app/i18n/resources.d.ts',
        enableSelector: false,
    },
});