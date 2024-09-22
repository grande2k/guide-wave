<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Языки (Интерфейс)</h2>
        </div>

        <div v-if="interfaces.length" class="admin-services__list">
            <div v-for="lang in interfaces" :key="lang.lang_code" class="admin-list-item" v-text="lang.name" @click="handleInterfaceClick(lang)"/>
        </div>

        <p v-else class="admin-message">Пусто</p>

        <button class="add-interface form-submit" @click="is_create_modal_open = true">
            <img src="@/assets/images/icons/close.svg" alt="plus">
            Добавить
        </button>
    </div>

    <edit-or-delete-modal
        v-if="is_dialog_modal_open"
        @edit="editInterface"
        @delete="deleteInterface"
        @close="closeModal"/>

    <add-interface-modal
        v-if="is_create_modal_open"
        @submitted="getInterfaces"
        @close="closeModal"/>

    <edit-interface-modal
        v-if="is_edit_modal_open"
        :data="selectedInterface"
        @submitted="getInterfaces"
        @close="closeModal"/>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { getInterfaceLanguages, deleteInterfaceLanguages } from '@/api';
    import { useAppStore } from '@/stores/app';
    import EditOrDeleteModal from '@/components/modals/admin/EditOrDeleteModal.vue';
    import AddInterfaceModal from '@/components/modals/admin/AddInterfaceModal.vue';
    import EditInterfaceModal from '@/components/modals/admin/EditInterfaceModal.vue';

    const appStore = useAppStore();
    const interfaces = ref([]);
    const is_dialog_modal_open = ref(false);
    const is_create_modal_open = ref(false);
    const is_edit_modal_open = ref(false);
    const selectedInterface = ref(null);

    onMounted(async () => {
        await getInterfaces();
    });

    const handleInterfaceClick = (data) => {
        is_dialog_modal_open.value = true;
        selectedInterface.value = data;
    }

    const deleteInterface = async () => {
        await deleteInterfaceLanguages(selectedInterface.value.lang_code);
        await getInterfaces();
        closeModal();
    }

    const editInterface = () => {
        is_dialog_modal_open.value = false;
        is_edit_modal_open.value = true;
    }

    const closeModal = () => {
        is_dialog_modal_open.value = false;
        is_create_modal_open.value = false;
        is_edit_modal_open.value = false;
        selectedInterface.value = null;
    }

    const getInterfaces = async () => {
        interfaces.value = await getInterfaceLanguages();
        appStore.setInterfaceLanguages(interfaces.value);
    }
</script>

<style scoped lang="scss">
    .add-interface {
        img {
            transform: rotate(45deg);
            filter: invert(1);
            width: 1.5rem;
            margin-right: 0.5rem;
        }
    }
</style>