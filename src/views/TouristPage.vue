<template>
    <section class="tourist page page--bg">
        <form class="tourist__form">
            <div class="tourist__form-field active">
                <p class="form-label">
                    <span>1</span>
                    {{ $t('location') }}
                </p>

                <div class="row">
                    <autocomplete-field :items="countries" :placeholder="$t('country')" @select="handleCountrySelect"/>
                    <autocomplete-field :items="cities" :placeholder="$t('city')" :disabled="!is_country_valid || !cities" @select="handleCitySelect"/>
                </div>
            </div>

            <div class="tourist__form-field" :class="{ 'active': form_data.country_id && form_data.city_id }">
                <p class="form-label">
                    <span>2</span>
                    {{ $t('language') }}
                </p>

                <form-select :options="['Русский', 'Английский', 'Испанский']" :placeholder="$t('placeholders.language')" @choose="e => form_data.language = e.toLowerCase()"/>
            </div>

            <div class="tourist__form-field" :class="{ 'active': form_data.country_id && form_data.city_id && form_data.language }">
                <p class="form-label">
                    <span>3</span>
                    {{ $t('service') }}
                </p>
                
                <form-select :options="['Экскурсия', 'Катание на лодке', 'Прыжки с парашюта']" :placeholder="$t('placeholders.service_type')" @choose="e => form_data.service = e.toLowerCase()"/>
            </div>

            <div class="tourist__form-field" :class="{ 'active': form_data.country_id && form_data.city_id && form_data.language && form_data.service }">
                <p class="form-label">
                    <span>4</span>
                    {{ $t('price') }}
                </p>
            
                <div class="tourist__form-tabs">
                    <div
                        class="tourist__form-tab"
                        v-for="(price, index) in prices"
                        :key="price.id"
                        :class="{ 'active': price.is_active }"
                        v-text="`${price.range}$`"
                        @click="handleTabClick(index)"/>
                </div>
            </div>

            <button type="submit" class="tourist__form-submit form-submit" :class="{ 'active': form_data.country_id && form_data.city_id && form_data.language && form_data.service }">
                <img src="@/assets/images/icons/search.svg" alt="Find">
                {{ $t('search') }}
            </button>
        </form>
    </section>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { defaultLocale } from '@/locales';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import axios from 'axios';
    import FormSelect from '@/components/FormSelect.vue';
    import AutocompleteField from '@/components/AutocompleteField.vue';

    const is_country_valid = ref(false);
    const { t } = useI18n();
    const toast = useToast();

    const form_data = ref({
        country_id: null,
        city_id: null,
        service: null,
        language: null,
        price_range: null,
    });

    const countries = ref(null);
    const cities = ref(null);

    onMounted(async () => {
        await getCountry();
    });

    const prices = ref([
        {
            range: '10-20',
            id: 0,
            is_active: false,
        },
        {
            range: '20-30',
            id: 1,
            is_active: false,
        },
        {
            range: '>30',
            id: 2,
            is_active: false,
        }
    ]);

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
            const params = { language: defaultLocale, country_id: form_data.value.country_id };
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
            getCity();
        } else {
            form_data.value.country_id = null;
            form_data.value.city_id = null;
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
            form_data.value.city_id = city_found.id;
        } else {
            form_data.value.city_id = null;
        }
    }

    const handleTabClick = (tabIndex) => {
        prices.value.forEach((tab, index) => {
            index === tabIndex ? tab.is_active = !tab.is_active : '';
        });

        const selectedPrice = prices.value.filter(price => price.is_active).map(price => price.range);
        selectedPrice ? form_data.price_range = selectedPrice : form_data.price_range = null;
        if(selectedPrice.length === 0) form_data.price_range = null;
    }
</script>

<style lang="scss" scoped>
    .tourist {
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
                &.active {
                    background-color: $white;
                    color: $primary;
                }
                @media screen and (max-width: 480px) {
                    padding: 0.75rem;
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
    }
</style>