import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { getInterface } from '@/api'
import Toast from 'vue-toastification'
import VueCookies from 'vue-cookies'
import App from '@/App.vue'
import router from '@/router'

import '@/assets/styles/main.scss'
import 'vue-toastification/dist/index.css'

const toastOptions = {
    position: 'top-right',
    timeout: 10000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
};

const createI18nInstance = async () => {
    const defaultLocale = localStorage.getItem('language') || 'en';

    const translations = {
        en: await getInterface('en'),
        ru: await getInterface('ru')
    };

    return createI18n({
        legacy: false,
        locale: defaultLocale,
        fallbackLocale: 'en',
        messages: translations
    });
}

(async () => {
    const i18n = await createI18nInstance();

    const app = createApp(App);

    app.config.globalProperties.$t = i18n.global.t;

    app.use(createPinia());
    app.use(i18n);
    app.use(router);
    app.use(Toast, toastOptions);
    app.use(VueCookies, { expires: '1m' });

    app.mount('#app');
})();