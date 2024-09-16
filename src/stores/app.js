import { defineStore } from "pinia";

export const useAppStore = defineStore("appStore", {
    state: () => ({
        admin_email: null,
    }),
    actions: {
        setAdminEmail(data) {
            this.admin_email = data;
        },
    },
});