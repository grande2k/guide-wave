<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Исполнители</h2>

            <button class="admin-topbar__filter" :class="{ active: show_filters }" @click="show_filters = !show_filters">
                <img src="@/assets/images/icons/filter.svg" alt="filter">
            </button>
        </div>

        <keep-alive>
            <admin-users-filter v-if="show_filters" @update="applyFilters"/>
        </keep-alive>

        <div v-if="sortedUsers.length" class="admin-users__list">
            <admin-user 
                v-for="user in sortedUsers"
                :key="user.user_id"
                :guide="user"
                :languages="languages"
                @update="handleGuidesUpdate"/>
        </div>

        <div v-if="show_preloader" class="preloader"><span></span></div>

        <p v-else class="admin-message">Пусто</p>
    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { getGuides, getAdminLanguages } from '@/api';
    import { useI18n } from 'vue-i18n';
    import AdminUser from './AdminUser.vue';
    import AdminUsersFilter from './AdminUsersFilter.vue';

    const users = ref([]);
    const languages = ref([]);
    const show_filters = ref(false);
    const show_preloader = ref(false);
    const filters = ref({});
    const { t } = useI18n();

    onMounted(async () => {
        show_preloader.value = true;
        users.value = await getGuides(t);
        show_preloader.value = false;
        languages.value = await getAdminLanguages(t);

        users.value.forEach(user => {
            if (user.cities && user.cities.length > 0) {
                let starredCities = user.cities.filter(city => city.startsWith('*')).map(city => city.slice(1));
                let otherCities = user.cities.filter(city => !city.startsWith('*'));
                user.cities = [...starredCities, ...otherCities];
            }
        });
    });

    const sortedUsers = computed(() => {
        let filtered = [...users.value];

        if (filters.value.status === 'on') {
            filtered = filtered.filter(user => user.is_active === true);
        } else if (filters.value.status === 'off') {
            filtered = filtered.filter(user => user.is_active === false || user.is_active === null);
        }

        if(filters.value.country_id) {
            filtered = filtered.filter(user => user.country_id === filters.value.country_id);
        }

        if (filters.value.country_id && filters.value.city) {
            filtered = filtered.filter(user => user.cities.includes(filters.value.city));
        }

        if (filters.value.sort_by === 'alphabet') {
            filtered.sort((a, b) => {
                const nameA = a.name || '';
                const nameB = b.name || '';

                if (!nameA && nameB) return 1;
                if (nameA && !nameB) return -1;
                if (!nameA && !nameB) return 0;

                return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
            });
        } else if (filters.value.sort_by === 'newest') {
            filtered.sort((a, b) => new Date(b.last_modified) - new Date(a.last_modified));
        } else if (filters.value.sort_by === 'oldest') {
            filtered.sort((a, b) => new Date(a.last_modified) - new Date(b.last_modified));
        }

        return filtered;
    });


    const handleGuidesUpdate = async () => {
        users.value = await getGuides(t);
    }

    const applyFilters = (newFilters) => {
        filters.value = { ...newFilters }
        console.log(filters.value);
    }
</script>

<style lang="scss" scoped>
    .admin-topbar__filter {
        @include flex-center;
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        border: 2px solid $white;
        cursor: pointer;
        margin-left: auto;
        &.active {
            background-color: $white;
            img {
                filter: invert(1);
            }
        }
        img {
            width: 1.75rem;
        }
    }
</style>