import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import Toast from 'vue-toastification'
import VueCookies from 'vue-cookies'
import App from '@/App.vue'
import router from '@/router'

import { languages, defaultLocale } from './locales'

import '@/assets/styles/main.scss'
import 'vue-toastification/dist/index.css'

const messages = Object.assign(languages)

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('language') || defaultLocale,
    warnHtmlMessage: false,
    messages
})

const toastOptions = {
    position: "top-right",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
}

const app = createApp(App)

app.config.globalProperties.$t = i18n.t

app.use(createPinia())
app.use(i18n)
app.use(router)
app.use(Toast, toastOptions)
app.use(VueCookies, { expires: '1m'})
app.mount('#app')