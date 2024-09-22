<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Языки (Критерий)</h2>
        </div>

        <div v-if="languages.length" class="admin-services__list">
            <div
                v-for="lang in languages"
                :key="lang.lang_code"
                class="admin-list-item"
                v-text="lang.languages_names.ru || lang.languages_names.en"
                @click="handleLanguageClick(lang)"/>
        </div>

        <p v-else class="admin-message">Пусто</p>

        <button class="add-language form-submit" @click="is_create_modal_open = true">
            <img src="@/assets/images/icons/close.svg" alt="plus">
            Добавить
        </button>
    </div>

    <edit-or-delete-modal
        v-if="is_dialog_modal_open"
        @edit="editLanguage"
        @delete="deleteLanguage"
        @close="closeModal"/>

    <create-modal 
        v-if="is_create_modal_open"
        type="languages"
        title="Добавить новый язык"
        @submitted="getLanguages"
        @close="closeModal"/>

    <edit-modal
        v-if="is_edit_modal_open"
        type="languages"
        :title="`Редактировать ${selectedLanguage.languages_names.ru} язык`"
        :initial-data="selectedLanguage"
        :old-lang-code="selectedLanguage.lang_code"
        @submitted="getLanguages"
        @close="closeModal"/>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { getAdminLanguages, deleteAdminLanguage } from '@/api';
    import { useI18n } from 'vue-i18n';
    import EditOrDeleteModal from '@/components/modals/admin/EditOrDeleteModal.vue';
    import CreateModal from '@/components/modals/admin/CreateModal.vue';
    import EditModal from '@/components/modals/admin/EditModal.vue';

    const languages = ref([]);
    const is_dialog_modal_open = ref(false);
    const is_create_modal_open = ref(false);
    const is_edit_modal_open = ref(false);
    const selectedLanguage = ref(null);
    const { t } = useI18n();

    onMounted(async () => {
        await getLanguages();
    });

    const handleLanguageClick = (data) => {
        is_dialog_modal_open.value = true;
        selectedLanguage.value = data;
    }

    const deleteLanguage = async () => {
        await deleteAdminLanguage(selectedLanguage.value);
        await getLanguages();
        closeModal();
    }

    const editLanguage = () => {
        is_dialog_modal_open.value = false;
        is_edit_modal_open.value = true;
    }

    const getLanguages = async () => {
        languages.value = await getAdminLanguages(t);
    }

    const closeModal = () => {
        is_dialog_modal_open.value = false;
        is_create_modal_open.value = false;
        is_edit_modal_open.value = false;
        selectedLanguage.value = null;
    }
</script>

<style scoped lang="scss">
    .add-language {
        img {
            transform: rotate(45deg);
            filter: invert(1);
            width: 1.5rem;
            margin-right: 0.5rem;
        }
    }
</style>