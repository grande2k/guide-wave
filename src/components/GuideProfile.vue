<template>
    <section class="guide-profile page page--bg">
        <div class="guide-profile__content" v-if="guide_profile">
            <div class="guide-profile__info">
                <guide-photo :photo_url="guide_profile.photo_url"/>

                <div class="row">
                    <p class="guide-profile__label" v-text="`${$t('profile.guide.status.label')}:`"/>
                    <guide-status-toggler :status="guide_profile.status"/>
                </div>
            </div>

            <form action="" class="guide-profile__form" @submit.prevent="updateUserInfo">
                <div class="guide-profile__form-field">
                    <p class="form-label" v-text="$t('tel')"/>

                    <input
                        type="tel"
                        class="form-input"
                        name="tel"
                        :placeholder="$t('placeholders.tel')"
                        v-model="guide_profile.phone">
                </div>

                <div class="guide-profile__form-field">
                    <p class="form-label" v-text="$t('profile.guide.name')"/>

                    <input
                        type="text"
                        class="form-input"
                        name="name"
                        :placeholder="$t('placeholders.name')"
                        v-model="guide_profile.name">
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('location')"/>

                    <div class="row">
                        <autocomplete-field
                            :items="countries"
                            :value="guide_profile.country_id"
                            :placeholder="$t('country')"
                            @select="handleCountrySelect"/>

                        <autocomplete-field
                            :items="cities"
                            :value="guide_profile.city_id"
                            :placeholder="$t('city')"
                            :disabled="!cities || !is_country_valid"
                            @select="handleCitySelect"/>
                    </div>
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('language')"/>

                    <form-select :options="['Русский', 'Английский', 'Испанский']" :placeholder="$t('placeholders.language')" @choose="e => console.log(e)"/>
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('profile.guide.services_and_prices')"/>

                    <form-select :options="['Экскурсия', 'Катание на лодке', 'Прыжки с парашюта']" :placeholder="$t('placeholders.service_type')" @choose="e => console.log(e)"/>
                </div>

                <button type="sub" class="form-submit full-column" v-text="$t('save')"/>
            </form>
        </div>

        <div v-else class="preloader">
            <span></span>
        </div>
    </section>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter } from 'vue-router';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { defaultLocale } from '@/locales';
    import axios from 'axios';
    import AutocompleteField from './AutocompleteField.vue';
    import FormSelect from './FormSelect.vue';
    import GuideStatusToggler from './GuideStatusToggler.vue';
    import GuidePhoto from './GuidePhoto.vue';

    const router = useRouter();
    const { t } = useI18n();
    const toast = useToast();

    const guide_profile = ref(null);
    const countries = ref(null);
    const cities = ref(null);
    const is_country_valid = ref(false);

    onMounted(async () => {
        await getProfile();
        await getCountry();
    });

    const getProfile = async () => {
        try {
            const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
            const response = await axios.get('https://guides-to-go.onrender.com/user_info', request_headers);

            guide_profile.value = response.data.info_about_user;
            guide_profile.value.languages = ['ru'];
            console.log(guide_profile.value);

            if(guide_profile.value.country_id) {
                await getCity();
                is_country_valid.value = true;
            }
        } catch (err) {
            switch (err.response.status) {
                case 401:
                    $cookies.remove("access_token");
                    router.push('/login');
                    break;
                default:
                    toast.error(t('errors.default'));
                    break;
            }
        }
    }

    const getCountry = async () => {
        try {
            const params = { language: defaultLocale };
            const response = await axios.post('https://guides-to-go.onrender.com/search/get_country', params);

            console.log(response.data);
            countries.value = response.data.countries;
        } catch (err) {
            switch (err.response.status) {
                default:
                    toast.error(t('errors.default'));
                    break;
            }
        }
    }

    const getCity = async () => {
        try {
            const params = { language: defaultLocale, country_id: guide_profile.value.country_id };
            const response = await axios.post('https://guides-to-go.onrender.com/search/get_city', params);

            console.log(response.data);
            cities.value = response.data.cities;
        } catch (err) {
            switch (err.response.status) {
                default:
                    toast.error(t('errors.default'));
                    break;
            }
        }
    }

    const updateUserInfo = async () => {
        try {
            const params = guide_profile.value;
            const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
            const response = await axios.post('https://guides-to-go.onrender.com/user_info/', params, request_headers);

            console.log(response.data);
            await getProfile();
            toast.success(t('messages.save_success'));
        } catch (err) {
            switch (err.response.status) {
                default:
                    toast.error(t('errors.default'));
                    break;
            }
        }
    }

    const handleCountrySelect = (country) => {
        let country_found;
        let isValidCountry;

        if(typeof country === 'string') {
            const string_country = countries.value.find(item => item.name.toLowerCase() === country.toLowerCase());
            if(string_country) country_found = string_country;
        } else if(typeof country === 'object') {
            country_found = country;
        }

        if(country_found) isValidCountry = countries.value.some(item => item.name.toLowerCase() === country_found.name.toLowerCase());

        if(isValidCountry) {
            guide_profile.value.country_id = country_found.id;
            is_country_valid.value = true;
            getCity();
        } else {
            guide_profile.value.country_id = null;
            guide_profile.value.city_id = null;
            is_country_valid.value = false;
            cities.value = null;
        }
    }

    const handleCitySelect = (city) => {
        let city_found;
        let isValidCity;

        if (typeof city === 'string') {
            const string_city = cities.value.find(item => item.name.toLowerCase() === city.toLowerCase());
            if (string_city) city_found = string_city;
        } else if (typeof city === 'object') {
            city_found = city;
        }

        if (city_found) isValidCity = cities.value.some(item => item.name.toLowerCase() === city_found.name.toLowerCase());

        if (isValidCity) {
            guide_profile.value.city_id = city_found.id;
        } else {
            guide_profile.value.city_id = null;
        }
    }
</script>

<style lang="scss" scoped>
    .guide-profile {
        &__label {
            margin: 0;
            color: $white;
        }
        &__content {
            display: flex;
            @media screen and (max-width: 480px) {
                display: block;
                .row {
                    @include flex-center;

                }
            }
        }
        &__form {
            @include grid(2, 0.5rem);
            margin-left: 2rem;
            @media screen and (max-width: 480px) {
                margin-left: 0;
                margin-top: 0.75rem; 
            }
            .full-column {
                grid-column: 1/3;
            }
            &-field {
                &.full-column {
                    .form-label {
                        text-align: center;
                        justify-content: center;
                    }
                }
                .row {
                    @include grid(2, 0.5rem);
                }
            }
        }
    }
</style>