<template>
    <section class="search page page--bg">
        <form v-show="!results" action="#" class="search__form scroll-parent white-scroll" @submit.prevent="submitForm">
            <div class="search__form-field active">
                <p class="form-label">
                    <span>1</span>
                    {{ $t('location') }}
                </p>

                <div class="row">
                    <autocomplete-field
                        :items="countries"
                        :placeholder="$t('country')"
                        :disabled="!countries || !countries.length"
                        @select="handleCountrySelect"/>

                    <autocomplete-field
                        cities
                        :items="cities"
                        :placeholder="$t('city')"
                        :disabled="!cities || !cities.length || !is_country_valid"
                        @select="handleCitySelect"/>
                </div>
            </div>

            <div class="search__form-field" :class="{ 'active': form_data.country_id && form_data.cities }">
                <p class="form-label">
                    <span>2</span>
                    {{ $t('language') }}
                </p>

                <search-language-select
                    :options="languages"
                    :all-selected-languages="[form_data.language]"
                    @choose="handleLanguagesSelect"/>
            </div>

            <div class="search__form-field" :class="{ 'active': form_data.country_id && form_data.cities && (form_data.language_code && form_data.language_code.length) }">
                <p class="form-label">
                    <span>3</span>
                    {{ $t('service') }}
                </p>
                
                <services-select
                    fixed_position
                    tourist
                    :options="services"
                    :all_selected_services="[]" @choose="handleServiceSelect"/>
            </div>

            <div class="search__form-field" :class="{ 'active': form_data.country_id && form_data.cities && (form_data.language_code && form_data.language_code.length) && form_data.service_id }">
                <p class="form-label">
                    <span>4</span>
                    {{ $t('price') }}
                </p>
            
                <div class="search__form-tabs" v-if="prices && prices.length">
                    <div
                        class="search__form-tab"
                        v-for="(price, index) in prices"
                        :key="price.id"
                        :class="{ 'active': price.is_active }"
                        v-text="`${price.title}€`"
                        @click="handleTabClick(index)"/>
                </div>
            </div>

            <submit-button
                text="search"
                icon="search"
                class="search__form-submit form-submit"
                :class="{ 'active': form_data.country_id && form_data.cities && (form_data.language_code && form_data.language_code.length) && form_data.service_id }"
                :loading="response_loading"/>
        </form>

        <div v-if="paginatedResults && paginatedResults.length" class="search__results scroll-parent white-scroll">
            <p v-text="$t('search_results')" />

            <button class="search__results-repeat" @click="if(results && results.length > 0) showVideos();">
                <img src="@/assets/images/icons/refresh.svg" alt="refresh">
                {{ $t('watch_videos_again') }}
            </button>

            <guide
                v-for="(guide, index) in paginatedResults[currentPage]"
                :key="guide.user_id"
                :guide="guide"
                :services="services"
                :cities="cities"
                @callMade="handleCallMade(index)"/>

            <button
                v-if="canShowNextGroup"
                class="search__results-next"
                v-text="$t('show_next')"
                @click="showNextGroup"/>

            <button class="form-submit" v-text="$t('go_back_search')" @click="resetSearch" />
        </div>

        <div v-if="results && !results.length" class="search__results">
            <p v-text="$t('error_search_not_found')"/>

            <button class="form-submit" v-text="$t('go_back_search')" @click="resetSearch"/>
        </div>
    </section>

    <teleport to="#site-header">
        <button v-if="showOpenGalleryButton" class="open-gallery" @click="openGallery">
            <img src="@/assets/images/icons/minus.svg" alt="minus">
        </button>
    </teleport>

    <video-modal 
        v-if="is_video_shown" 
        close_disabled
        :guide_name="paginatedResults[currentPage][video_index].name"
        :guide_index="video_index + 1"
        :guides_count="paginatedResults[currentPage].length"
        :video_url="current_video_url"
        @close="is_video_shown  = false"
        @ended="showNextVideo"
        @switch="switchVideo"
        @back="is_video_shown = false; resetSearch()"/>

    <gallery
        v-if="is_gallery_open && backgrounds"
        :backgrounds="backgrounds"
        :first_city_id="form_data.cities ? form_data.cities[0] : 131"
        :cities="cities"
        :country_name="countries.find(country => country.id === form_data.country_id).name || ''"
        @close="is_gallery_open = false"/>
</template>

<script setup>
    import { ref, onMounted, computed, watch } from 'vue';
    import { getCountries, getCities, getBackgroundPhoto, getLanguages, getServices, search } from '@/api';
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import SearchLanguageSelect from '@/components/SearchLanguageSelect.vue';
    import AutocompleteField from '@/components/AutocompleteField.vue';
    import ServicesSelect from '@/components/ServicesSelect.vue';
    import SubmitButton from '@/components/SubmitButton.vue';
    import Guide from '@/components/Guide.vue';
    import VideoModal from '@/components/modals/VideoModal.vue';
    import Gallery from '@/components/Gallery.vue';
    import axios from 'axios';

    const { t } = useI18n();
    const is_country_valid = ref(false);
    const is_gallery_open = ref(false);
    const response_loading = ref(false);
    const toast = useToast();

    const currentPage = ref(0);
    const callsMade = ref([]);

    const form_data = ref({
        country_id: null,
        cities: null,
        service_id: null,
        language_code: null,
        price: [],
    });

    const countries = ref([]);
    const cities = ref([]);
    const languages = ref([]);
    const services = ref([]);
    const results = ref(null);
    const split_by = ref(null);
    const backgrounds = ref(null);

    onMounted(async () => {
        countries.value = await getCountries(t);
        languages.value = await getLanguages(t);
        services.value  = await getServices('tourist', t);
    });

    const rules = computed(() => {
        return {
            country_id: { required },
            cities: { required},
            service_id: { required },
            language_code: { required }
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const prices = ref([]);

    watch(() => form_data.value.service_id, async (newId) => {
        if(newId !== "" && newId !== null && newId !== undefined) {
            if(!v$.$invalid) {
                try {
                    const params = {
                        country_id: form_data.value.country_id,
                        cities: form_data.value.cities,
                        language_code: form_data.value.language_code,
                        service_id: form_data.value.service_id,
                    };
                    const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };

                    const response = await axios.post('https://guides-to-go.onrender.com/search/price_list', params, request_headers);

                    prices.value = response.data.price_list.map((price, index) => ({
                        title: price.title,
                        range: price.range,
                        id: index,
                        is_active: false
                    }));
                } catch(error) {
                    console.err(error);
                    toast.error(t('error_default'));
                }
            }
        }
    });

    const video_index = ref(0);
    const is_video_shown  = ref(false);
    const current_video_url = ref(null);

    const showVideos = () => {
        const currentGroup = paginatedResults.value && paginatedResults.value[currentPage.value];
        if (currentGroup && currentGroup.length > 0) {
            video_index.value = 0;
            current_video_url.value = currentGroup[video_index.value].video_url;
            is_video_shown.value = true;
        }
    }

    const showNextVideo = () => {
        video_index.value++;
        if (video_index.value < paginatedResults.value[currentPage.value].length && paginatedResults.value[currentPage.value][video_index.value].video_url) {
            current_video_url.value = paginatedResults.value[currentPage.value][video_index.value].video_url;
        } else {
            is_video_shown.value = false;
        }
    }

    const switchVideo = (index) => {
        video_index.value = index;
        current_video_url.value = paginatedResults.value[currentPage.value][video_index.value].video_url;
    }

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if (result) {
            response_loading.value = true;
            let response = await search(form_data.value, t);
            results.value = randomSort(response.users);
            split_by.value = response.split_by;
            response_loading.value = false;
            if (results.value && results.value.length > 0) showVideos();
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
            form_data.value.country_id = country_found.id;
            is_country_valid.value = true;
            backgrounds.value = await getBackgroundPhoto(country_found.country_code.toLowerCase(), t);
            if (backgrounds.value && backgrounds.value.country_photo) {
                document.body.style.backgroundImage = `url('https://guides-to-go.onrender.com${backgrounds.value.country_photo}')`;
                sessionStorage.setItem("background_image", `url('https://guides-to-go.onrender.com${backgrounds.value.country_photo}')`);
            } else {
                document.body.style.backgroundImage = sessionStorage.getItem("background_image");
            }
            cities.value = await getCities(form_data.value.country_id, t);
        } else {
            form_data.value.country_id = null;
            form_data.value.cities = null;
            is_country_valid.value = false;
            backgrounds.value = null;
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
            form_data.value.cities = [city_found.id];
            let city_background;
            if(backgrounds.value.cities_photos) {
                city_background = backgrounds.value?.cities_photos.find(city => city?.city_id === city_found?.id);
            }
            if (backgrounds.value && city_background) {
                document.body.style.backgroundImage = `url('https://guides-to-go.onrender.com${city_background.photo_url}')`;
                sessionStorage.setItem("background_image", `url('https://guides-to-go.onrender.com${city_background.photo_url}')`);
            } else if(backgrounds.value && backgrounds.value.country_photo && !city_background) {
                document.body.style.backgroundImage = `url('https://guides-to-go.onrender.com${backgrounds.value.country_photo}')`;
            }
            
        } else {
            form_data.value.cities = null;
        }
    }

    const handleLanguagesSelect = (langs) => {
        if (langs) form_data.value.language_code = langs;
        console.log(langs);
    }

    const handleServiceSelect = (service) => {
        if (service) form_data.value.service_id = service;
    }

    const handleTabClick = (tabIndex) => {
        prices.value.forEach((tab, index) => {
            index === tabIndex ? tab.is_active = !tab.is_active : '';
        });

        const selectedPrice = prices.value.filter(price => price.is_active).map(price => price.range);
        selectedPrice ? form_data.value.price = selectedPrice : form_data.value.price = [];
        if(selectedPrice.length === 0) form_data.value.price = [];
    }

    const resetSearch = () => {
        results.value = null;
        backgrounds.value = null;
        currentPage.value = 0;
        callsMade.value = [];
    }

    const paginatedResults = computed(() => {
        if(results.value) {
            const paginated = [];
            for (let i = 0; i < results.value.length; i += split_by.value) {
                paginated.push(results.value.slice(i, i + split_by.value));
            }
            return paginated;
        }
    });

    const canShowNextGroup = computed(() => {
        return callsMade.value.length === paginatedResults.value[currentPage.value].length
            && currentPage.value < paginatedResults.value.length - 1;
    });

    const handleCallMade = (index) => {
        if (!callsMade.value.includes(index)) {
            callsMade.value.push(index);
        }
    }

    const showNextGroup = () => {
        if (canShowNextGroup.value && currentPage.value < paginatedResults.value.length - 1) {
            currentPage.value++;
            video_index.value = 0;
            callsMade.value = [];
            showVideos();
        }
    }

    const randomSort = (array) => {
        return array.sort(() => Math.random() - 0.5);
    }

    const showOpenGalleryButton = computed(() => {
        return !is_gallery_open.value && backgrounds.value && backgrounds.value.country_photo;
    });

    const openGallery = () => {
        is_gallery_open.value = true;
    }
</script>

<style lang="scss" scoped>
    .search {
        &__form {
            &-field {
                margin-bottom: 2rem;
                opacity: 0.5;
                pointer-events: none;
                transition: $transition;
                @media screen and (max-width: 480px) {
                    margin-bottom: 1rem;
                }
                .row {
                    @include grid(2, 0.5rem);
                    @media screen and (max-width: 480px) {
                        grid-gap: 0.25rem;
                    }
                }
                &.active {
                    opacity: 1;
                    pointer-events: auto;
                }
            }
            &-tabs {
                @include grid(3, 1rem);
                @media screen and (max-width: 480px) {
                    grid-gap: 0.5rem;
                }
            }
            &-tab {
                text-align: center;
                border: 1px solid $white;
                border-radius: 0.5rem;
                background-color: transparent;
                padding: 1rem;
                cursor: pointer;
                transition: $transition;
                color: $white;
                font-weight: bold;
                font-size: 1.25rem;
                &.active {
                    background-color: $white;
                    color: $primary;
                }
                @media screen and (max-width: 480px) {
                    padding: 0.75rem;
                    font-size: 1.125rem;
                }
            }
            &-submit {
                opacity: 0.5;
                pointer-events: none;
                &.active {
                    opacity: 1;
                    pointer-events: auto;
                }
            }
        }
        &__results {
            & > p {
                color: $white;
                text-align: center;
                font-size: 1.5rem;
                margin: 0 0 1rem 0;
                @media screen and (max-width: 480px) {
                    font-size: 1.25rem;
                }
            }
            &-next {
                @include flex-center;
                width: 100%;
                border-radius: 0.5rem;
                margin-top: 1rem;
                cursor: pointer;
                border: none;
                padding: 1rem;
                background-color: $white;
                color: $black;
                font-weight: 500;
                font-size: 1.25rem;
                transition: all 0.3s ease;
                text-decoration: none;
                @media screen and (max-width: 480px) {
                    padding: 0.875rem;
                    font-size: 1rem;
                    height: 3rem;
                }
            }
            &-repeat {
                @include flex-center;
                position: relative;
                text-decoration: none;
                border-radius: 1rem;
                background-color: $white;
                padding: 1rem;
                width: 100%;
                font-weight: 500;
                font-size: 1rem;
                cursor: pointer;
                user-select: none;
                text-decoration: none;
                border: 2px solid $white;
                color: $black;
                max-width: 100%;
                margin-bottom: 3rem;
                &::after {
                    content: "";
                    position: absolute;
                    bottom: -1.5rem;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-color: $white;
                }
                img {
                    margin-right: 0.5rem;
                    width: 1.5rem;
                    @media screen and (max-width: 480px) {
                        width: 1.325rem;
                    }
                }
                @media screen and (max-width: 480px) {
                    font-size: 0.875rem;
                }
            }
        }
    }

    .open-gallery {
        @include flex-center;
        width: 3rem;
        height: 3rem;
        background-color: $white;
        color: $black;
        border-radius: 0.5rem;
        cursor: pointer;
        margin-left: 2rem;
        img {
            width: 1.5rem;
        }
    }
</style>