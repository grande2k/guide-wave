<template>
    <div class="layout">
        <router-link v-if="$route.name !== 'home'" to="/" class="go-home">
            <img src="@/assets/images/icons/home.svg" alt="home">
            {{ $t('go_home') }}
        </router-link>

        <div id="site-header">
            <h1 class="logo">
                Guide Wave
                <br v-if="$cookies.get('user_role') === '2' && $route.name === 'admin'">
                <span v-if="$cookies.get('user_role') === '2' && $route.name === 'admin'">Администратор</span>
            </h1>
        </div>

        <router-view/>
    </div>
</template>

<script setup>
    import { onMounted, watch } from 'vue';
    import { getUserLocation, getBackgroundPhoto, getAdminMail, getCountries, getInterfaceLanguages, getDuration } from '@/api';
    import { useAppStore } from '@/stores/app';
    import { useI18n } from 'vue-i18n';
    import { useRoute } from 'vue-router';

    const appStore = useAppStore();
    const route = useRoute();
    const { t } = useI18n();

    onMounted(async () => {
        const user_location = await getUserLocation(t);
        const user_country_code = user_location?.country.toLowerCase();
        if(user_country_code) {
            const user_location_background = await getBackgroundPhoto(user_country_code, t);
            if(user_location_background.country_photo) {
                document.body.style.backgroundImage = `url('https://api.theguidewave.com${user_location_background.country_photo}')`;
                sessionStorage.setItem("background_image", `url('https://api.theguidewave.com${user_location_background.country_photo}')`);
                sessionStorage.setItem("user_bg", `url('https://api.theguidewave.com${user_location_background.country_photo}')`);
            }
        }
        
        appStore.setAdminEmail(await getAdminMail(t));
        appStore.setCountries(await getCountries(t));
        appStore.setInterfaceLanguages(await getInterfaceLanguages(t));
        appStore.setMaxVideoDuration(await getDuration(t));
    });

    watch(route, (newRoute) => {
        if(newRoute.name !== 'search') {
            document.body.style.backgroundImage = sessionStorage.getItem("user_bg");
        }
    });
</script>

<style lang="scss" scoped>
    .layout {
        @include flex-center-column;
        height: 100%;
        position: relative;
        z-index: 2;
        padding: 0 1rem;
        .go-home {
            position: absolute;
            top: 2rem;
            left: 2rem;
            background-color: $white;
            padding: 1rem;
            text-decoration: none;
            border-radius: 0.5rem;
            color: $black;
            img {
                display: none;
            }
            @media screen and (max-width: 480px) {
                @include flex-center;
                top: 1rem;
                left: 1rem;
                font-size: 0;
                padding: 0.75rem;
                img {
                    display: block;
                    width: 1.5rem;
                }
            }
        }
        #site-header {
            @include flex-center;
            margin-bottom: 2rem;
            @media screen and (max-width: 480px) {
                margin-bottom: 1rem;
            }
            .logo {
                text-align: center;
                color: $primary;
                font-size: 2.75rem;
                font-weight: bold;
                margin: 0;
                line-height: 1;
                span {
                    display: block;
                    font-weight: normal;
                    font-size: 1.5rem;
                    font-weight: 500;
                    line-height: 1;
                    margin-top: 0.5rem;
                }
                @media screen and (max-width: 480px) {
                    font-size: 2.5rem;
                }
            }
        }
    }
</style>