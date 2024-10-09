<template>
    <div class="guides-filter">
        <h2 class="guides-filter__title">Сортировка:</h2>

        <div class="guides-filter__sort">
            <button class="guides-filter__option" :class="{ active: filters.sort_by === 'alphabet' }" @click="setSort('alphabet')">
                По алфавиту
            </button>

            <button class="guides-filter__option" :class="{ active: filters.sort_by === 'newest' }" @click="setSort('newest')">
                Сначала новые
            </button>
        
            <button class="guides-filter__option" :class="{ active: filters.sort_by === 'oldest' }" @click="setSort('oldest')">
                Сначала старые
            </button>
        </div>

        <h2 class="guides-filter__title">Фильтры:</h2>

        <div class="guides-filter__field">
            <p>Статус:</p>
            
            <div class="field-wrapper">
                <select name="status" v-model="filters.status">
                    <option value="" disabled selected>Выберите из списка</option>
                    <option value="on">Включен</option>
                    <option value="off">Выключен</option>
                </select>

                <button v-if="filters.status" class="clear-filter" @click="filters.status = ''">
                    <img src="@/assets/images/icons/close.svg" alt="delete">
                </button>
            </div>
        </div>

        <div class="guides-filter__field">
            <p>Локация:</p>
        
            <div class="grid-half">
                <div class="field-wrapper">
                    <select name="country" v-model="filters.country_id">
                        <option value="" disabled selected>Страна</option>
                        <option v-for="(country, index) in countries" :key="index" :value="country.id" v-text="country.name"/>
                    </select>

                    <button v-if="filters.country_id" class="clear-filter" @click="filters.country_id = ''">
                        <img src="@/assets/images/icons/close.svg" alt="delete">
                    </button>
                </div>

                <div class="field-wrapper" :class="{ disabled: !filters.country_id }">
                    <select name="city" v-model="filters.city">
                        <option value="" disabled selected>Город</option>
                        <option v-for="(city, index) in cities" :key="index" :value="city.name" v-text="city.name"/>
                    </select>

                    <button v-if="filters.city" class="clear-filter" @click="filters.city = ''">
                        <img src="@/assets/images/icons/close.svg" alt="delete">
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, watch, onMounted } from 'vue';
    import { useAppStore } from '@/stores/app';
    import { getCities } from '@/api';
    
    const emit = defineEmits(['update']);
    const appStore = useAppStore();
    const countries = ref(null);
    const cities = ref(null);

    const filters = reactive({
        sort_by: "",
        status: "",
        country_id: "",
        city: "" 
    });

    onMounted(() => emit('update', filters));

    watch(() => appStore.countries, (newCountries) => {
        if(newCountries) countries.value = newCountries;
    }, { immediate: true });

    watch(() => filters.country_id, async (newValue) => {
        filters.city = "";
        if(newValue) {
            cities.value = await getCities(filters.country_id);
            const capital_index = cities.value.findIndex(item => item.name.startsWith('*'));
            if (capital_index !== -1) {
                const capital = cities.value.splice(capital_index, 1)[0];
                capital.name = capital.name.slice(1);
                cities.value.unshift(capital);
            }
        }
    });

    watch(filters, () => {
        emit('update', filters);
    });

    const setSort = (type) => {
        filters.sort_by === type ? filters.sort_by = "" : filters.sort_by = type;
    }
</script>

<style lang="scss" scoped>
    .guides-filter {
        color: $white;
        padding-bottom: 1rem;
        border-bottom: 2px solid $white;
        margin-bottom: 2rem;
        .grid-half {
            @include grid(2, 0.75rem);
        }
        &__sort {
            @include grid(3, 0.75rem);
            margin-bottom: 1rem;
            @media screen and (max-width: 480px) {
                grid-template-columns: 1fr;
            }
        }
        &__title {
            text-align: center;
            margin: 0 0 1rem 0;
            font-weight: normal;
            @media screen and (max-width: 480px) {
                font-size: 1.25rem;
            }
        }
        &__option {
            @include flex-center;
            padding: 0.75rem;
            border: 2px solid $white;
            border-radius: 0.5rem;
            text-align: center;
            cursor: pointer;
            height: 3rem;
            &.active {
                background-color: $white;
                color: $black;
            }
            img {
                width: 1.25rem;
                margin-right: 0.25rem;
                filter: invert(1);
            }
        }
        &__field {
            margin: 1rem 0;
            & > p {
                margin: 0 0 0.5rem 0;
            }
        }
        .field-wrapper {
            display: flex;
            &.disabled {
                opacity: 0.5;
                pointer-events: none;
            }
            select {
                display: block;
                width: 100%;
                height: 3rem;
                background-color: $white;
                color: $black;
                cursor: pointer;
                outline: none;
                border-radius: 0.5rem;
                padding: 0 0.75rem;
            }
            .clear-filter {
                @include flex-center;
                margin-left: 0.5rem;
                width: 3rem;
                border-radius: 0.5rem;
                border: 2px solid $white;
                cursor: pointer;
                img {
                    width: 1.5rem;
                    filter: invert(1);
                }
            }
        }
    }
</style>