<template>
    <div class="translations">
        <select class="translations__lang" v-model="locale" @change="getInterface(locale)">
            <option value="en">Английский</option>
            <option value="ru">Русский</option>
        </select>

        <form class="translations__form" @submit.prevent="submitTranslations">
            <translation-fields v-if="locale === 'ru'" :translations="translations.ru" v-model="translations.ru" />
            <translation-fields v-if="locale === 'en'" :translations="translations.en" v-model="translations.en" />

            <submit-button text="save" icon="check" :loading="is_loading"/>
        </form>

        <p v-if="message">{{ message }}</p>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { getInterface, updateInterface } from '@/api';
    import { useI18n } from 'vue-i18n';
    import { useToast } from 'vue-toastification';
    import TranslationFields from './TranslationFields.vue';
    import SubmitButton from './SubmitButton.vue';

    const { t } = useI18n();
    const toast = useToast();
    const is_loading = ref(false);

    const translations = ref({
        ru: {},
        en: {}
    });
    const message = ref('');
    const locale = ref('ru');

    onMounted(async () => {
        translations.value.ru = await getInterface('ru');
        translations.value.en = await getInterface('en');
    });

    const submitTranslations = async () => {
        try {
            const params = { language: locale.value, info: translations.value[locale.value] };
            is_loading.value = true;
            await updateInterface(params, t);
            toast.success('Успешно');
            is_loading.value = false;
        } catch {
            toast.error('Ошибка');
        }
    }
</script>

<style lang="scss" scoped>
    .translations {
        &__lang {
            display: block;
            width: 100%;
            height: 3rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
            cursor: pointer;
        }
    }
</style>