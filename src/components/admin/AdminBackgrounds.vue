<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Фоновые изображения</h2>
        </div>

        <div v-if="backgrounds.length" class="admin-backgrounds__list">
            <div v-for="item in backgrounds" :key="item.lang_code" class="admin-list-item"
                v-text="country_name(item)" @click="handleItemClick(item)" />
        </div>

        <p v-else class="admin-message">Пусто</p>

        <button class="add-background form-submit" @click="is_create_modal_open = true">
            <img src="@/assets/images/icons/close.svg" alt="plus">
            Добавить
        </button>
    </div>

    <edit-or-delete-modal
        v-if="is_dialog_modal_open"
        @edit="editItem"
        @delete="deleteItem"
        @close="closeModal" />

    <create-modal v-if="is_create_modal_open" type="backgrounds" title="Добавить новый фон" @submitted="getBackgrounds"
        @close="closeModal" />

    <edit-modal v-if="is_edit_modal_open" type="backgrounds"
        :title="`Редактировать ${selectedItem.name} фон`" :initial-data="selectedItem" @submitted="getBackgrounds" @close="closeModal" />
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { getAdminBackgrounds, deleteBackground } from '@/api';
    import EditOrDeleteModal from '@/components/modals/admin/EditOrDeleteModal.vue';
    import CreateModal from '@/components/modals/admin/CreateModal.vue';
    import EditModal from '@/components/modals/admin/EditModal.vue';

    const backgrounds = ref([]);
    const is_dialog_modal_open = ref(false);
    const is_create_modal_open = ref(false);
    const is_edit_modal_open = ref(false);
    const selectedItem = ref(null);

    onMounted(async () => {
        await getBackgrounds();
    });

    const country_name = (country) => {
        if(country.name && country.country_code) {
            return `${country.name} (${country.country_code})`;
        } else {
            return country.country_code;
        }
    }

    const handleItemClick = (data) => {
        is_dialog_modal_open.value = true;
        selectedItem.value = data;
    }

    const deleteItem = async () => {
        const params = {
            photo_url: selectedItem.value.photo_url,
            country_code: selectedItem.value.country_code
        };

        await deleteBackground(params);
        await getBackgrounds();
        closeModal();
    }

    const editItem = () => {
        is_dialog_modal_open.value = false;
        is_edit_modal_open.value = true;
    }

    const getBackgrounds = async () => {
        backgrounds.value = await getAdminBackgrounds();
    }

    const closeModal = () => {
        is_dialog_modal_open.value = false;
        is_create_modal_open.value = false;
        is_edit_modal_open.value = false;
        selectedItem.value = null;
    }
</script>

<style scoped lang="scss">
    .add-background {
        img {
            transform: rotate(45deg);
            filter: invert(1);
            width: 1.5rem;
            margin-right: 0.5rem;
        }
    }
</style>