<template>
    <section class="guide-profile page page--bg">
        <div class="guide-profile__content scroll-parent white-scroll" v-if="guide_profile && countries.length && languages.length">
            <div class="guide-profile__info">
                <guide-photo :photo_url="guide_profile.photo_url"/>

                <div class="row">
                    <p class="guide-profile__label" v-text="`${$t('profile.guide.status.label')}:`"/>
                    <guide-status-toggler
                        :approved_status="approved_status"
                        :status="guide_profile.status"/>
                </div>

                <button class="calendar-button" @click="isCalendarModalOpen = true">
                    <img src="@/assets/images/icons/calendar.svg" alt="calendar">
                    {{ $t('calendar') }}
                </button>

                <calendar-modal
                    v-if="isCalendarModalOpen"
                    :dates="guide_profile.calendar"
                    @close="closeCalendar"
                    @updated="async () => guide_profile = await getProfile(router, $t)"/>
            </div>

            <form action="" class="guide-profile__form" @submit.prevent="submitForm">
                <div class="guide-profile__form-field">
                    <p class="form-label" v-text="$t('tel')"/>

                    <input
                        type="tel"
                        class="form-input"
                        :class="{ error: v$.phone.$errors.length }"
                        name="tel"
                        maxlength="15"
                        :placeholder="$t('placeholders.tel')"
                        v-model="guide_profile.phone"
                        @input="guide_profile.phone = validatePhone($event.target.value)">

                    <span v-if="v$.phone.$errors.length && v$.phone.minLength.$invalid" class="form-error" v-text="$t('errors.phone_length')"/>
                </div>

                <div class="guide-profile__form-field">
                    <p class="form-label" v-text="$t('profile.guide.name')"/>

                    <input
                        type="text"
                        class="form-input"
                        :class="{ error: v$.phone.$errors.length }"
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
                            :error="v$.country_id.$errors.length"
                            @select="handleCountrySelect"/>

                        <autocomplete-field
                            :items="cities"
                            :value="guide_profile.city_id"
                            :placeholder="$t('city')"
                            :disabled="!cities || !is_country_valid"
                            :error="guide_profile.country_id && v$.city_id.$errors.length"
                            @select="handleCitySelect"/>
                    </div>
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('language')"/>

                    <div v-if="guide_profile.languages.length" class="guide-profile__languages">
                        <form-language-select
                            v-for="(language, index) in guide_profile.languages"
                            :key="index"
                            :options="languages"
                            :all-selected-languages="guide_profile.languages"
                            :selected="language"
                            :error="language === '' && v$.languages.$errors.length ? true : false"
                            able_delete
                            @choose="(lang) => handleLanguageSelect(lang, index)"
                            @delete="handleLanguageDelete(index)"/>
                    </div>

                    <form-language-select
                        v-else
                        :options="languages"
                        :all-selected-languages="guide_profile.languages"
                        :error="v$.languages.$errors.length ? true : false"
                        @choose="handleLanguageSelect"/>
                    
                    <div v-if="guide_profile.languages && guide_profile.languages.length < 5" class="form-add" @click="guide_profile.languages.push('');">
                        <span>+</span>
                        {{ $t('add') }}
                    </div>
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('profile.guide.services_and_prices')" />

                    <div v-if="services.length">
                        <guide-service-field 
                            v-for="(service, index) in services"
                            :key="index"
                            :value="service"
                            :all_selected_services="services"
                            :error="((!service.service_id || !service.price) && v1$.$errors.length) ? true : false"
                            @update="s => handleServiceUpdate(s, index)"
                            @delete="handleServiceDelete(index)"/>
                    </div>

                    <div v-if="services.length < 5" class="form-add" @click="addService">
                        <span>+</span>
                        {{ $t('add') }}
                    </div>
                </div>

                <submit-button text="save" icon="check" :loading="response_loading" class="full-column"/>

                <button type="button" class="logout full-column" @click="logout">
                    <img src="@/assets/images/icons/login.svg" alt="log out">
                    {{ $t('log_out') }}
                </button>
            </form>
        </div>

        <div v-else class="preloader">
            <span></span>
        </div>
    </section>
</template>

<script setup>
    import { ref, onMounted, computed, watch } from 'vue';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { useVuelidate } from '@vuelidate/core';
    import { useRouter } from 'vue-router';
    import { required, minLength, helpers } from '@vuelidate/validators';
    import { validatePhone } from '@/utils/validatePhone';
    import { getCountries, getCities, getLanguages, getProfile, getServices } from '@/api';
    import axios from 'axios';
    import AutocompleteField from '@/components/AutocompleteField.vue';
    import FormLanguageSelect from '@/components/FormLanguageSelect.vue';
    import GuideServiceField from '@/components/GuideServiceField.vue';
    import GuideStatusToggler from '@/components/GuideStatusToggler.vue';
    import GuidePhoto from '@/components/GuidePhoto.vue';
    import SubmitButton from '@/components/SubmitButton.vue';
    import CalendarModal from '@/components/modals/CalendarModal.vue'

    const { t } = useI18n();
    const toast = useToast();
    const router = useRouter();

    const guide_profile = ref(null);
    const countries = ref([]);
    const cities = ref([]);
    const languages = ref([]);
    const services = ref([]);
    const is_country_valid = ref(false);
    const response_loading = ref(false);
    const isCalendarModalOpen = ref(false);

    onMounted(async () => {
        guide_profile.value = await getProfile(router, t);
        if (guide_profile.value.country_id) { cities.value = await getCities(guide_profile.value.country_id, t); is_country_valid.value = true; }
    
        countries.value = await getCountries(t);
        languages.value = await getLanguages(t);
        services.value  = await getServices('guide', t);

        if (!services.value.length) services.value.push({ service_id: null, price: null });
    });

    const approved_status = computed(() => {
        switch (guide_profile.value.approved) {
            case null:
                return 'not_checked';
                break;
            case false:
                return 'declined';
                break;
            case true:
                return 'approved';
                break;
            default:
                return ''
                break;
        }
    });

    const languagesValidator = helpers.withMessage(
        'Language must be selected',
        (languages) => languages.length > 0 && languages.every(lang => lang !== '')
    );

    const serviceIdValidator = helpers.withMessage(
        'name',
        (value) => value.every(service => service.service_id)
    );

    const servicePriceValidator = helpers.withMessage(
        'price',
        (value) => value.every(service => service.price)
    );

    const rules = computed(() => {
        return {
            phone: { required, minLength: minLength(7) },
            name: { required },
            country_id: { required },
            city_id: { required },
            languages: { required, languagesValidator }
        }
    });

    const services_rules = computed(() => {
        return {
            services: { required, serviceIdValidator, servicePriceValidator }
        }
    });

    const services_state = ref({ services: services.value });

    watch(services, (newValue) => {
        if(newValue) services_state.value.services = newValue;
    }, { deep: true, immediate: true });

    const v$ = useVuelidate(rules, guide_profile);
    const v1$ = useVuelidate(services_rules, services_state);

    const updateUserInfo = async () => {
        try {
            const params = guide_profile.value;
            const services_params = { services: services.value };
            const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };

            response_loading.value = true;

            await axios.post('https://guides-to-go.onrender.com/user_info/', params, request_headers);
            await axios.post('https://guides-to-go.onrender.com/service/update_services', services_params, request_headers);

            response_loading.value = false;
            toast.success(t('messages.save_success'));

            guide_profile.value = await getProfile(router, t);
            services.value = await getServices('guide', t);
        } catch (err) {
            response_loading.value = false;

            switch (err.response.status) {
                default:
                    toast.error(t('errors.default'));
                    break;
            }
        }
    }

    const submitForm = async () => {
        const result = await v$.value.$validate() && await v1$.value.$validate();

        if (result) {
            updateUserInfo();
        } else {
            toast.error(t('errors.validation'));
        }
    }

    const handleCountrySelect = async (country) => {
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
            cities.value = await getCities(guide_profile.value.country_id, t);
        } else {
            guide_profile.value.country_id = null;
            guide_profile.value.city_id = null;
            is_country_valid.value = false;
            cities.value = [];
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

    const handleLanguageSelect = (lang, index) => {
        if(lang) {
            if(typeof index === 'number') {
                guide_profile.value.languages[index] = lang;
            } else {
                guide_profile.value.languages.push(lang);
            }
        }
    }

    const handleServiceUpdate = (service, index) => {
        if (service && service.service_id && service.price) {
            if(typeof index === 'number') {
                services.value[index] = service;
            } else {
                services.value.push(service);
            }

            v1$.value.$touch();
            v1$.value.$reset();
        }
    }

    const handleServiceDelete = (index) => {
        if(services.value.length > 1) services.value.splice(index, 1);
    }

    const handleLanguageDelete = (index) => {
        if(guide_profile.value.languages.length > 1) guide_profile.value.languages.splice(index, 1);
    }


    const addService = () => {
        if (services.value.length < 5) {
            services.value.push({
                service_id: null,
                price: null,
            });
        }
    }

    const closeCalendar = async (isCalendarChanged) => {
        isCalendarModalOpen.value = false;
        if(isCalendarChanged) guide_profile.value = await getProfile(router, t);
    }

    const logout = () => {
        $cookies.remove("access_token");
        $cookies.remove("user_role");
        router.push('/login');
    }
</script>

<style lang="scss" scoped>
    .guide-profile {
        min-height: 500px;
        overflow: hidden;
        padding-right: 1rem;
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
        &__info {
            .calendar-button {
                @include flex-center-column;
                width: 100%;
                aspect-ratio: 1;
                border-radius: 0.5rem;
                background-color: transparent;
                border: 2px solid $white;
                cursor: pointer;
                margin-top: 2rem;
                color: $white;
                font-weight: bold;
                padding: 0.5rem;
                img {
                    width: 2.25rem;
                    margin-bottom: 0.5rem;
                }
                @media screen and (max-width: 480px) {
                    flex-direction: row;
                    aspect-ratio: unset;
                    margin: 1rem 0;
                    padding: 1rem;
                    img {
                        width: 1.5rem;
                        margin: 0 0.5rem 0 0;
                    }
                }
            }
        }
        &__form {
            @include grid(2, 0.5rem);
            margin-left: 1.25rem;
            flex: auto;
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
        .logout {
            margin-top: 0.5rem;
        }
    }
</style>