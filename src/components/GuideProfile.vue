<template>
    <section class="guide-profile page page--bg">
        <div class="guide-profile__content" v-if="guide_profile">
            <div class="guide-profile__info">
                <label for="guide-photo" class="guide-profile__photo">
                    <div v-if="previewImage" class="guide-profile__photo-preview">
                        <img :src="previewImage" alt="Photo Preview" />
                    </div>
                    <div class="guide-profile__photo-add">
                        <span>+</span>
                        <p v-text="$t('profile.guide.upload_photo')"/>
                    </div>
                </label>

                <input type="file" accept="image/*" id="guide-photo" @change="onFileChange">

                <div class="row">
                    <p class="guide-profile__label" v-text="`${$t('profile.guide.status.label')}:`"/>

                    <button class="guide-profile__status" :class="{ 'guide-profile__status--off': !status_value }" @click="toggleStatus()">
                        <span/>

                        <p>
                            {{ status_value ? $t('profile.guide.status.on') : $t('profile.guide.status.off') }}
                        </p>
                    </button>
                </div>
            </div>

            <form action="" class="guide-profile__form">
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
                        <autocomplete-field :items="countries" :placeholder="$t('country')" @select="handleCountrySelect"/>
                        <autocomplete-field :items="cities" :placeholder="$t('city')" :disabled="!is_country_valid || !cities" @select="handleCitySelect"/>
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
    import { ref, onMounted, inject } from 'vue';
    import { useRouter } from 'vue-router';
    import { useToggle } from '@vueuse/core';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { defaultLocale } from '@/locales';
    import axios from 'axios';
    import AutocompleteField from './AutocompleteField.vue';
    import FormSelect from './FormSelect.vue';

    const router = useRouter();
    const $cookies = inject('$cookies');
    const { t } = useI18n();
    const toast = useToast();

    const [status_value, toggleStatus] = useToggle();

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
            console.log(guide_profile.value);
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

    const previewImage = ref(null);

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            previewImage.value = null;
        }
    }
</script>

<style lang="scss" scoped>
    .guide-profile {
        &__photo {
            display: block;
            border-radius: 50%;
            width: 6.5rem;
            height: 6.5rem;
            position: relative;
            cursor: pointer;
            background-color: $secondary;
            border: 1px solid $white;
            &-preview {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                border-radius: inherit;
                img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: inherit;
                }
            }
            &-add {
                span {
                    @include flex-center;
                    font-family:'Courier New', Courier, monospace;
                    line-height: 1;
                    position: absolute;
                    top: 45%;
                    left: 50%;
                    transform: translate(-50%, -45%);
                    color: $white;
                    font-size: 3rem;
                    font-weight: 100;
                    width: 1.75rem;
                    height: 1.75rem;
                    @media screen and (max-width: 480px) {
                        font-size: 2rem;
                        width: 1rem;
                        height: 1rem;
                    }
                }
                p {
                    position: absolute;
                    bottom: 0.625rem;
                    left: 50%;
                    transform: translateX(-50%);
                    color: $white;
                    text-align: center;
                    font-size: 0.675rem;
                    margin: 0;
                    font-weight: 500;
                    @media screen and (max-width: 480px) {
                        font-size: 0.625rem;
                        bottom: 0.325rem;   
                    }
                }
            }
            @media screen and (max-width: 480px) {
                width: 5rem;
                height: 5rem;
                margin: 0 auto -0.625rem auto;
            }
        }
        #guide-photo {
            width: 0.1px;
            height: 0.1px;
            visibility: hidden;
            opacity: 0;
            position: relative;
            z-index: -1;
        }
        &__label {
            margin: 0;
            color: $white;
        }
        &__status {
            @include flex-center-vert;
            margin-top: 0.75rem;
            border-radius: 1.75rem;
            padding: 0.5rem;
            height: 2.5rem;
            width: 6rem;
            cursor: pointer;
            background-color: $secondary;
            position: relative;
            transition: all 0.5s ease;
            span {
                position: absolute;
                display: block;
                right: 0.325rem;
                width: 1.75rem;
                height: 1.75rem;
                background-color: $white;
                border-radius: 50%;
                transition: transform 0.5s ease;
                z-index: 2;
                @media screen and (max-width: 480px) {
                    width: 1.5rem;
                    height: 1.5rem;
                }
            }
            p {
                position: relative;
                z-index: 1;
                color: $white;
                margin: 0;
                width: calc(100% - 2rem);
                text-align: center;
                font-size: 0.875rem;
                @media screen and (max-width: 480px) {
                    font-size: 0.75rem;
                    width: calc(100% - 1.5rem);
                }
            }
            &--off {
                background-color: $white;
                p {
                    color: $black;
                    margin-left: auto;
                }
                span {
                    transform: translateX(-3.5rem);
                    background-color: $black;
                    @media screen and (max-width: 480px) {
                        transform: translateX(-3rem);
                    }
                }
            }
            @media screen and (max-width: 480px) {
                margin-top: 0;
                margin-left: 0.75rem;
                width: 5rem;
                height: 2rem;
                padding: 0.325rem;
            }
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