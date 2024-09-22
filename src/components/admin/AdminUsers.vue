<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Исполнители</h2>
        </div>

        <div v-if="users.length" class="admin-users__list">
            <admin-user 
                v-for="user in users"
                :key="user.user_id"
                :guide="user"
                :languages="languages"
                @update="handleGuidesUpdate"/>
        </div>

        <p v-else class="admin-message">Пусто</p>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { getGuides, getAdminLanguages } from '@/api';
    import { useI18n } from 'vue-i18n';
    import AdminUser from './AdminUser.vue';

    const users = ref([]);
    const languages = ref([]);
    const { t } = useI18n();

    onMounted(async () => {
        users.value = await getGuides(t);
        languages.value = await getAdminLanguages(t);
    });

    const handleGuidesUpdate = async () => {
        users.value = await getGuides(t);
    }
</script>