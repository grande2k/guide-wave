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
                <div class="admin-list-item" @click="handleCountryClick(country)">
                    <strong v-text="country.country_names.ru || country.country_names.en"/>
                </div>

                <div class="cities">
                    <ul v-if="country.cities && country.cities.length" class="admin-locations__cities">
                        <li v-for="city in country.cities" :key="city.city_id" class="admin-list-item" v-text="city.city_names.ru || city.city_names.en" @click="handleCityClick(city)"/>
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

    const locations = ref([]);
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

    const handleCityClick = (city) => {
        is_dialog_modal_open.value = true;
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
