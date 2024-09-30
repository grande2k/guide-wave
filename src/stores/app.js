import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
    state: () => ({
        admin_email: null,
        countries: null,
        interface_languages: null,
        max_video_duration: null,
    }),
    actions: {
        setAdminEmail(data) {
            this.admin_email = data;
        },
        setCountries(data) {
            this.countries = data;
        },
        setInterfaceLanguages(data) {
            this.interface_languages = data;
        },
        setMaxVideoDuration(data) {
            this.max_video_duration = data;
        },
    },
});