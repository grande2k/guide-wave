<template>
    <section class="guide-profile page page--bg">
        <div class="guide-profile__content scroll-parent white-scroll"
            v-if="guide_profile && countries.length && languages.length">
            <div class="guide-profile__info">
                <guide-photo :photo_url="guide_profile.photo_url" @upload="preparePhoto"/>

                <div class="row">
                    <p class="guide-profile__label" v-text="$t('status')" />
                    <guide-status-toggler :approved_status="approved_status" :profile_valid="!v$.$invalid && !v1$.$invalid"
                        :status="guide_profile.status"/>
                </div>

                <button v-if="guide_profile.status" class="calendar-button" @click="openCalendar">
                    <img src="@/assets/images/icons/calendar.svg" alt="calendar">
                    {{ $t('calendar') }}
                </button>

                <calendar-modal v-if="isCalendarModalOpen" :dates="guide_profile.calendar" @close="closeCalendar"
                    @updated="async () => guide_profile = await getProfile(router, $t)" />
            </div>

            <form action="" class="guide-profile__form" @submit.prevent="submitForm">
                <div class="guide-profile__form-field">
                    <p class="form-label" v-text="$t('phone_number')" />

                    <input type="tel" class="form-input" :class="{ error: v$.phone.$errors.length }" name="tel"
                        maxlength="15" :placeholder="$t('phone_number_placeholder')" v-model="guide_profile.phone"
                        @input="guide_profile.phone = validatePhone($event.target.value)">

                    <span v-if="v$.phone.$errors.length && v$.phone.minLength.$invalid" class="form-error"
                        v-text="$t('error_phone_length')" />
                </div>

                <div class="guide-profile__form-field">
                    <p class="form-label" v-text="$t('name')" />

                    <input type="text" class="form-input" :class="{ error: v$.phone.$errors.length }" name="name"
                        :placeholder="$t('name_placeholder')" v-model="guide_profile.name">
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('location')" />

                    <div class="row">
                        <autocomplete-field :items="countries" :value="guide_profile.country_id"
                            :placeholder="$t('country')" :error="v$.country_id.$errors.length"
                            @select="handleCountrySelect" />

                        <autocomplete-field :items="cities" :value="guide_profile.city_id" :placeholder="$t('city')"
                            :disabled="!cities || !is_country_valid"
                            :error="guide_profile.country_id && v$.city_id.$errors.length" @select="handleCitySelect" />
                    </div>
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('language')" />

                    <div v-if="guide_profile.languages.length" class="guide-profile__languages">
                        <form-language-select v-for="(language, index) in guide_profile.languages" :key="index"
                            :options="languages" :all-selected-languages="guide_profile.languages" :selected="language"
                            :error="language === '' && v$.languages.$errors.length ? true : false" able_delete
                            @choose="(lang) => handleLanguageSelect(lang, index)" @delete="handleLanguageDelete(index)" />
                    </div>

                    <div v-if="guide_profile.languages && guide_profile.languages.length < 5" class="form-add"
                        @click="guide_profile.languages.push('');">
                        <span>+</span>
                        {{ $t('add') }}
                    </div>
                </div>

                <div class="guide-profile__form-field full-column">
                    <p class="form-label" v-text="$t('services_and_prices')" />

                    <div v-if="services.length">
                        <guide-service-field v-for="(service, index) in services" :key="index" :value="service"
                            :all_selected_services="services"
                            :error="((!service.service_id || !service.price) && v1$.$errors.length) ? true : false"
                            @update="s => handleServiceUpdate(s, index)" @delete="handleServiceDelete(index)" />
                    </div>

                    <div v-if="services.length < 5" class="form-add" @click="addService">
                        <span>+</span>
                        {{ $t('add') }}
                    </div>
                </div>

                <guide-video-upload :video_url="guide_profile.video_url ?? ''"
                    :max_video_duration="guide_profile.max_video_duration"
                    @deleted="async () => guide_profile = await getProfile(router, $t)"
                    @upload="file => prepareVideo(file, 'upload')"
                    @update="file => prepareVideo(file, 'update')" />

                <submit-button text="save" icon="check" :loading="response_loading" class="full-column" />

                <button
                    type="button"
                    class="change-password full-column"
                    @click="isUpdatePasswordModalOpen = true">
                    <img src="@/assets/images/icons/key.svg" alt="key">
                    {{ $t('change_password') }}
                </button>

                <a :href="`mailto:${appStore.admin_email}`" class="form-link full-column">
                    <img src="@/assets/images/icons/mail.svg" alt="Mail">
                    {{ $t('contact_admin') }}
                </a>

                <button type="button" class="logout full-column" @click="logout">
                    <img src="@/assets/images/icons/login.svg" alt="log out">
                    {{ $t('logout') }}
                </button>
            </form>
        </div>

        <div v-else class="preloader">
            <span></span>
        </div>
    </section>

    <change-password-modal
        v-if="isUpdatePasswordModalOpen"
        :new_password="new_password"
        @close="isUpdatePasswordModalOpen = false"/>

    <new-password-modal
        v-if="isNewPasswordModalOpen"
        :new_password="new_password"
        @edit="isNewPasswordModalOpen = false; isUpdatePasswordModalOpen = true"
        @close="isNewPasswordModalOpen = false"/>
</template>

<script setup>
    import { ref, onMounted, computed, watch } from 'vue';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { useVuelidate } from '@vuelidate/core';
    import { useRouter, useRoute } from 'vue-router';
    import { useAppStore } from '@/stores/app';
    import { required, minLength, helpers } from '@vuelidate/validators';
    import { validatePhone } from '@/utils/validatePhone';
    import { getCountries, getCities, getLanguages, getProfile, getServices } from '@/api';
    import axios from 'axios';
    import AutocompleteField from '@/components/AutocompleteField.vue';
    import FormLanguageSelect from '@/components/FormLanguageSelect.vue';
    import GuideServiceField from '@/components/guide/GuideServiceField.vue';
    import GuideStatusToggler from '@/components/guide/GuideStatusToggler.vue';
    import GuidePhoto from '@/components/guide/GuidePhoto.vue';
    import SubmitButton from '@/components/SubmitButton.vue';
    import CalendarModal from '@/components/modals/CalendarModal.vue';
    import GuideVideoUpload from '@/components/guide/GuideVideoUpload.vue';
    import ChangePasswordModal from '@/components/modals/ChangePasswordModal.vue';
    import NewPasswordModal from '@/components/modals/NewPasswordModal.vue';

    const { t } = useI18n();
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();
    const appStore = useAppStore();

    const guide_profile = ref(null);
    const countries = ref([]);
    const cities = ref([]);
    const languages = ref([]);
    const services = ref([]);
    const is_country_valid = ref(false);
    const response_loading = ref(false);
    const new_password = ref(null);
    const isCalendarModalOpen = ref(false);
    const isUpdatePasswordModalOpen = ref(false);
    const isNewPasswordModalOpen = ref(false);

    onMounted(async () => {
        guide_profile.value = await getProfile(router, t);
        if (guide_profile.value.country_id) { cities.value = await getCities(guide_profile.value.country_id, t); is_country_valid.value = true; }

        countries.value = await getCountries(t);
        languages.value = await getLanguages(t);
        services.value = await getServices('guide', t);

        if (route.query.newPassword) {
            new_password.value = route.query.newPassword;
            isNewPasswordModalOpen.value = true;
            router.push('/profile');
        }
    });

    const approved_status = computed(() => {
        switch (guide_profile.value.approved) {
            case null:
                return 'not_checked';
            case false:
                return 'declined';
            case true:
                return 'approved';
            default:
                return '';
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
        (value) => value.every(service => service.price !== '' && service.price !== null && service.price !== undefined && service.price >= 0)
    );

    const rules = computed(() => {
        if (guide_profile.value) {
            if (guide_profile.value.languages.length > 0) {
                return {
                    phone: { required, minLength: minLength(7) },
                    name: { required },
                    country_id: { required },
                    city_id: { required },
                    languages: { required, languagesValidator }
                }
            } else {
                return {
                    phone: { required, minLength: minLength(7) },
                    name: { required },
                    country_id: { required },
                    city_id: { required }
                }
            }
        }
    });

    const services_rules = computed(() => {
        if (services.value) {
            if (services.value.length > 0) {
                return {
                    services: { required, serviceIdValidator, servicePriceValidator }
                }
            }
        }
    });

    const services_state = ref({ services: services.value });

    watch(services, (newValue) => {
        if (newValue) services_state.value.services = newValue;
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

            let photoUploadPromise = null;

            if (uploading_photo.value) {
                photoUploadPromise = new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            const fd = new FormData();
                            fd.append('file', uploading_photo.value, uploading_photo.value.name);
                            const response = await axios.post('https://guides-to-go.onrender.com/user_info/add_photo', fd, request_headers);
                            resolve(response);
                        } catch (error) {
                            reject(error);
                        }
                    }, 1000);
                });
            }

            let videoUploadPromise = null;

            if (uploading_video.value) {
                videoUploadPromise = new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            const fd = new FormData();
                            fd.append('file', uploading_video.value, uploading_video.value.name);
                            const response = await axios.post('https://guides-to-go.onrender.com/user_info/add_video', fd, request_headers);
                            resolve(response);
                        } catch (error) {
                            reject(error);
                        }
                    }, 1000);
                });
            } else if (updating_video.value) {
                videoUploadPromise = new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        try {
                            const fd = new FormData();
                            const request_params = { params: { old_video_url: guide_profile.value.video_url }, headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
                            fd.append('new_file', updating_video.value, updating_video.value.name);
                            const response = await axios.put('https://guides-to-go.onrender.com/user_info/update_video', fd, request_params);
                            resolve(response);
                        } catch (error) {
                            reject(error);
                        }
                    }, 1000);
                });
            }

            if (photoUploadPromise) {
                await photoUploadPromise;
            }

            if (videoUploadPromise) {
                await videoUploadPromise;
            }

            response_loading.value = false;
            uploading_video.value = null;
            updating_video.value = null;
            toast.success(t('message_save_success'));

            guide_profile.value = await getProfile(router, t);
            services.value = await getServices('guide', t);

        } catch (err) {
            response_loading.value = false;

            switch (err.response?.status) {
                default:
                    toast.error(t('error_default'));
                    break;
            }
        }
    }


    const submitForm = async () => {
        const result = await v$.value.$validate() && await v1$.value.$validate();

        if (result) {
            updateUserInfo();
        } else {
            toast.error(t('error_validation'));
        }
    }

    const handleCountrySelect = async (country) => {
        let country_found;
        let isValidCountry;

        if (typeof country === 'string') {
            const string_country = countries.value.find(item => item.name.toLowerCase() === country.toLowerCase());
            if (string_country) country_found = string_country;
        } else if (typeof country === 'object') {
            country_found = country;
        }

        if (country_found) isValidCountry = countries.value.some(item => item.name.toLowerCase() === country_found.name.toLowerCase());

        if (isValidCountry) {
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
        if (lang) {
            if (typeof index === 'number') {
                guide_profile.value.languages[index] = lang;
            } else {
                guide_profile.value.languages.push(lang);
            }
        }
    }

    const handleServiceUpdate = (service, index) => {
        if (service && service.service_id && service.price) {
            if (typeof index === 'number') {
                services.value[index] = service;
            } else {
                services.value.push(service);
            }

            v1$.value.$touch();
            v1$.value.$reset();
        }
    }

    const handleServiceDelete = (index) => {
        services.value.splice(index, 1);
    }

    const handleLanguageDelete = (index) => {
        guide_profile.value.languages.splice(index, 1);
    }


    const addService = () => {
        if (services.value.length < 5) {
            services.value.push({
                service_id: null,
                price: null,
            });
        }
    }

    const openCalendar = async () => {
        const result = !v$.value.$invalid && !v1$.value.$invalid;

        if (result) {
            isCalendarModalOpen.value = true
        } else {
            toast(t('message_fill_profile'));
        }
    }

    const closeCalendar = async (isCalendarChanged) => {
        isCalendarModalOpen.value = false;
        if (isCalendarChanged) guide_profile.value = await getProfile(router, t);
    }

    const uploading_photo = ref(null);

    const preparePhoto = (file) => {
        uploading_photo.value = file;
    }

    const uploading_video = ref(null);
    const updating_video = ref(null);

    const prepareVideo = (file, action)=> {
        console.log(file);
        switch (action) {
            case 'upload':
                uploading_video.value = file;
                break;
            case 'update':
                updating_video.value = file;
                break;
            default:
                console.error('wrong action prepareVideo');
                break;
        }
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

            .form-link {
                margin: 0.25rem 0;

                @media screen and (max-width: 480px) {
                    padding: 0.875rem;
                    font-size: 1rem;
                    height: 3rem;
                    margin: 0.25rem 0 !important;
                }
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
            .change-password {
                @include flex-center;
                width: 100%;
                background-color: $white;
                color: $black;
                padding: 1rem;
                border-radius: 0.5rem;
                font-size: 1.25rem;
                cursor: pointer;
                margin: 0.25rem 0 0 0;
                @media screen and (max-width: 480px) {
                    padding: 0.875rem;
                    font-size: 1rem;
                    height: 3rem;
                }
                img {
                    width: 1.5rem;
                    margin-right: 0.5rem;
                    @media screen and (max-width: 480px) {
                        width: 1.25rem;
                    }
                }
            }
        }

        .logout {
            margin: 0;
        }
    }
</style>