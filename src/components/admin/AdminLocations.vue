<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Страны и города</h2>
        </div>

        <div v-if="locations.length" class="admin-locations__list">
            <div v-for="country in locations" :key="country.country_id">
                <div class="admin-list-item">
                    <strong v-text="country.country_names.ru || country.country_names.en" @click="handleCountryClick(country)"/>

                    <div class="location-background" @click="handleCountryBackgroundClick(country)">
                        <img v-if="country.country_photo_url" :src="`https://api.theguidewave.com${country.country_photo_url}`" alt="background">
                        <div v-else class="location-background-empty"/>
                    </div>
                </div>

                <div class="cities">
                    <ul v-if="country.cities && country.cities.length" class="admin-locations__cities">
                        <li v-for="city in country.cities" :key="city.city_id" class="admin-list-item">
                            <strong v-text="city.city_names.ru || city.city_names.en" @click="handleCityClick(city)"/>
                            
                            <div class="location-background" @click="handleCityBackgroundClick(city)">
                                <img v-if="city.city_photo_url" :src="`https://api.theguidewave.com${city.city_photo_url}`" alt="background">
                                <div v-else class="location-background-empty"/>
                            </div>
                        </li>
                    </ul>

                    <p v-else class="admin-message">Нет городов</p>

                    <button class="add-location form-submit" @click="handleCityAdd(country.country_id)">
                        <img src="@/assets/images/icons/close.svg" alt="plus">
                        Добавить город
                    </button>
                </div>
            </div>
        </div>

        <p v-else class="admin-message">Нет стран</p>

        <button class="add-location form-submit" @click="handleCountryAdd">
            <img src="@/assets/images/icons/close.svg" alt="plus">
            Добавить страну
        </button>
    </div>

    <background-modal
        v-if="is_background_modal_open"
        :title="modal_params.title"
        :type="modal_params.type"
        :initial-data="modal_params.type === 'countries' ? selectedCountry : selectedCity"
        :photo_url="modal_params.type === 'countries' ? selectedCountry.country_photo_url ?? '' : selectedCity.city_photo_url ?? ''"
        @close="closeModal"
        @update="getLocationsFunction" />

    <edit-or-delete-modal
        v-if="is_dialog_modal_open"
        @edit="editLocation"
        @delete="deleteLocation"
        @close="closeModal" />

    <create-modal
        v-if="is_create_modal_open"
        :type="modal_params.type"
        :title="modal_params.title"
        :country_id="modal_params.country_id"
        @submitted="getLocationsFunction"
        @close="closeModal" />

    <edit-modal
        v-if="is_edit_modal_open"
        :type="modal_params.type"
        :title="modal_params.title"
        :initial-data="modal_params.type === 'countries' ? selectedCountry : selectedCity"
        @submitted="getLocationsFunction"
        @close="closeModal" />
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { getLocations, deleteCity, deleteCountry } from '@/api';
    import EditOrDeleteModal from '@/components/modals/admin/EditOrDeleteModal.vue';
    import CreateModal from '@/components/modals/admin/CreateModal.vue';
    import EditModal from '@/components/modals/admin/EditModal.vue';
    import BackgroundModal from '../modals/admin/BackgroundModal.vue';

    const locations = ref([]);
    const is_background_modal_open = ref(false);
    const is_dialog_modal_open = ref(false);
    const is_create_modal_open = ref(false);
    const is_edit_modal_open = ref(false);
    const selectedCountry = ref(null);
    const selectedCity = ref(null);
    const modal_params = ref({
        type: "",
        title: "",
        country_id: null,
    });

    onMounted(async () => {
        await getLocationsFunction();
    });

    const handleCountryClick = (country) => {
        is_dialog_modal_open.value = true;
        selectedCountry.value = country;
    }

    const handleCountryBackgroundClick = (country) => {
        modal_params.value.type = "countries";
        modal_params.value.title = country.country_names.ru || country.country_names.en;
        is_background_modal_open.value = true;
        selectedCountry.value = country;
    }


    const handleCityClick = (city) => {
        is_dialog_modal_open.value = true;
        selectedCity.value = city;
    }

    const handleCityBackgroundClick = (city) => {
        modal_params.value.type = "cities";
        modal_params.value.title = city.city_names.ru || city.city_names.en;
        is_background_modal_open.value = true;
        selectedCity.value = city;
    }

    const handleCountryAdd = () => {
        modal_params.value.type = "countries";
        modal_params.value.title = "Добавить новую страну";
        is_create_modal_open.value = true;
    }

    const handleCityAdd = (country_id) => {
        modal_params.value.type = "cities";
        modal_params.value.title = "Добавить новый город";
        modal_params.value.country_id = country_id;
        is_create_modal_open.value = true;
    }

    const deleteLocation = async () => {
        console.log(selectedCountry.value, selectedCity.value);
        if (selectedCity.value) {
            console.log(selectedCity.value);
            await deleteCity(selectedCity.value.city_names);
        } else if (selectedCountry.value) {
            console.log(selectedCountry.value);
            await deleteCountry(selectedCountry.value.country_id);
        }
        await getLocationsFunction();
        closeModal();
    }

    const editLocation = () => {
        is_dialog_modal_open.value = false;
        is_edit_modal_open.value = true;
        if(selectedCity.value) {
            modal_params.value.type = "cities";
            modal_params.value.title = "Редактировать город: " + selectedCity.value.city_names.ru;
        } else if (selectedCountry.value) {
            modal_params.value.type = "countries";
            modal_params.value.title = "Редактировать страну: " + selectedCountry.value.country_names.ru;
        }
    }

    const getLocationsFunction = async () => {
        locations.value = await getLocations();
    }

    const closeModal = () => {
        is_background_modal_open.value = false;
        is_dialog_modal_open.value = false;
        is_create_modal_open.value = false;
        is_edit_modal_open.value = false;
        selectedCity.value = null;
        selectedCountry.value = null;
        modal_params.value.type = "";
        modal_params.value.title = "";
        modal_params.value.country_id = null;
    }
</script>

<style lang="scss" scoped>
    .admin-locations {
        &__list {
            & > *:not(:last-child) {
                margin-bottom: 2rem;
            }
        }
        &__list {
            .admin-list-item {
                display: flex;
                padding: 0;
                background-color: transparent;
                cursor: default;
                strong {
                    @include flex-center-vert;
                    padding: 0.75rem 1rem;
                    flex: auto;
                    background-color: $white;
                    border-radius: inherit;
                    cursor: pointer;
                    height: 3.5rem;
                }
                .location-background {
                    width: 3.5rem;
                    height: 3.5rem;
                    padding: 0.375rem;
                    background-color: $white;
                    border-radius: inherit;
                    margin-left: 0.5rem;
                    cursor: pointer;
                    &-empty {
                        width: 100%;
                        height: 100%;
                        background-color: #c5c5c5;
                    }
                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }
            }
            .cities {
                padding: 0 0 0 1.5rem;
                button {
                    margin-top: 0.5rem;
                    background-color: transparent;
                    border: 2px solid $white;
                }
            }
        }
    }
    .add-location {
        img {
            transform: rotate(45deg);
            filter: invert(1);
            width: 1.5rem;
            margin-right: 0.5rem;
        }
    }
</style>
