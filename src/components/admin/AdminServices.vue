<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Услуги</h2>
        </div>

        <div v-if="services.length" class="admin-services__list">
            <div
                v-for="service in filteredServices"
                :key="service.services_name.en"
                class="admin-list-item"
                v-text="service.services_name.ru || service.services_name.en"
                @click="handleServiceClick(service)"/>
        </div>

        <p v-else class="admin-message">Пусто</p>

        <button class="add-service form-submit" @click="is_create_modal_open = true">
            <img src="@/assets/images/icons/close.svg" alt="plus">
            Добавить
        </button>
    </div>

    <edit-or-delete-modal
        v-if="is_dialog_modal_open"
        @edit="editService"
        @delete="deleteService"
        @close="closeModal"/>

    <create-modal 
        v-if="is_create_modal_open"
        type="services"
        title="Добавить новую услугу"
        @submitted="getServices"
        @close="closeModal"/>

    <edit-modal
        v-if="is_edit_modal_open"
        type="services"
        :title="`Редактировать услугу: ${selectedService.services_name.ru}`"
        :initial-data="selectedService"
        @submitted="getServices"
        @close="closeModal"/>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { getAdminServices, deleteAdminService } from '@/api';
    import EditOrDeleteModal from '@/components/modals/admin/EditOrDeleteModal.vue';
    import CreateModal from '@/components/modals/admin/CreateModal.vue';
    import EditModal from '@/components/modals/admin/EditModal.vue';

    const services = ref([]);
    const is_dialog_modal_open = ref(false);
    const is_create_modal_open = ref(false);
    const is_edit_modal_open = ref(false);
    const selectedService = ref(null);

    onMounted(async () => {
        await getServices();
    });

    const filteredServices = computed(() => {
        return services.value.filter(service => service.services_name.ru !== "Все услуги");
    })

    const handleServiceClick = (data) => {
        is_dialog_modal_open.value = true;
        selectedService.value = data;
    }

    const deleteService = async () => {
        await deleteAdminService(selectedService.value);
        await getServices();
        closeModal();
    }

    const editService = () => {
        is_dialog_modal_open.value = false;
        is_edit_modal_open.value = true;
    }

    const getServices = async () => {
        services.value = await getAdminServices();
    }

    const closeModal = () => {
        is_dialog_modal_open.value = false;
        is_create_modal_open.value = false;
        is_edit_modal_open.value = false;
        selectedService.value = null;
    }
</script>

<style scoped lang="scss">
    .add-service {
        img {
            transform: rotate(45deg);
            filter: invert(1);
            width: 1.5rem;
            margin-right: 0.5rem;
        }
    }
</style>