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
                    <autocomplete-field :items="cities" :placeholder="$t('city')" :disabled="!is_country_valid" @select="handleCitySelect"/>
                </div>
            </div>

            <div class="tourist__form-field" :class="{ 'active': form_data.country && form_data.city }">
                <p class="form-label">
                    <span>2</span>
                    {{ $t('language') }}
                </p>

                <select name="language" class="tourist__form-select form-select" v-model="lowercaseLanguage">
                    <option v-for="(lang, index) in languages" :key="index" :value="lang" v-text="lang"/>
                </select>
            </div>

            <div class="tourist__form-field" :class="{ 'active': form_data.country && form_data.city && form_data.language }">
                <p class="form-label">
                    <span>3</span>
                    {{ $t('service') }}
                </p>
                
                <select name="service" class="tourist__form-select form-select" v-model="lowercaseService">
                    <option v-for="(service, index) in services" :key="index" :value="service" v-text="service"/>
                </select>
            </div>

            <div class="tourist__form-field" :class="{ 'active': form_data.country && form_data.city && form_data.language && form_data.service }">
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

            <button type="submit" class="tourist__form-submit form-submit" :class="{ 'active': form_data.country && form_data.city && form_data.language && form_data.service }">
                <img src="@/assets/images/icons/search.svg" alt="Find">
                {{ $t('search') }}
            </button>
        </form>
    </section>
</template>

<script setup>
    import { ref, reactive, computed } from 'vue';
    import AutocompleteField from '@/components/AutocompleteField.vue';

    const is_country_valid = ref(false);

    const form_data = reactive({
        country: null,
        city: null,
        service: null,
        language: null,
        price_range: null,
    });

    const countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua &amp; Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia &amp; Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Congo", "Cook Islands", "Costa Rica", "Cote D Ivoire", "Croatia", "Cruise Ship", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Estonia", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Polynesia", "French West Indies", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Kyrgyz Republic", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Pierre &amp; Miquelon", "Samoa", "San Marino", "Satellite", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "St Kitts &amp; Nevis", "St Lucia", "St Vincent", "St. Lucia", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor L'Este", "Togo", "Tonga", "Trinidad &amp; Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks &amp; Caicos", "Uganda", "Ukraine", "USA", "United Arab Emirates", "United Kingdom", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Virgin Islands (US)", "Yemen", "Zambia", "Zimbabwe"];

    const cities = ["Moscow", "New-York", "Ufa", "Kazan", "Saints-Peterburg", "Paris"];

    const languages = ["Russian", "English", "Uzbek", "Poland"];

    const services = ["Excursion", "Boat ride", "Museums", "Skydiving"];

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

    const lowercaseLanguage = computed({
        get() {
            return form_data.language;
        },
        set(value) {
            form_data.language = value.toLowerCase();
        }
    });

    const lowercaseService = computed({
        get() {
            return form_data.service;
        },
        set(value) {
            form_data.service = value.toLowerCase();
        }
    });

    const handleCountrySelect = (country) => {
        const isValidCountry = countries.some(item => item.toLowerCase() === country.toLowerCase());
        if(isValidCountry) {
            is_country_valid.value = true;
            form_data.country = country.toLowerCase();
        } else {
            is_country_valid.value = false;
            form_data.country = null;
        }
    }

    const handleCitySelect = (city) => {
        const isValidCity = cities.some(item => item.toLowerCase() === city.toLowerCase());
        if (isValidCity) {
            form_data.city = city.toLowerCase();
        } else {
            form_data.city = null;
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