<template>
    <div class="admin__child">
        <div class="admin-topbar">
            <router-link to="/admin" class="admin-topbar__back">
                <img src="@/assets/images/icons/arrow-left.svg" alt="Назад">
                Назад
            </router-link>

            <h2 class="admin-topbar__title">Надписи</h2>
        </div>

        <form class="translations" @submit.prevent="submitTranslations">
            <select class="translations__lang" v-model="locale" @change="getInterfaceHelper">
                <option v-for="lang in appStore.interface_languages" :key="lang.lang_code" :value="lang.lang_code" v-text="lang.name"/>
            </select>
            
            <div class="translations__list">
                <div v-for="(value, key) in translations[locale]" :key="key" class="translations__field">
                    <label :for="key" v-text="key"/>
                    <input class="form-input" v-model="translations[locale][key]" :id="key" />
                </div>
            </div>

            <submit-button text="save" icon="check"/>
        </form>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useAppStore } from '@/stores/app';
    import { getInterface, updateInterface } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';

    const appStore = useAppStore();
    const translations = ref({});
    const locale = ref('en');

    onMounted(async () => {
        getInterfaceHelper();
    });

    const getInterfaceHelper = async () => {
        if(!translations.value[locale.value]) translations.value[locale.value] = await getInterface(locale.value);
    }

    const submitTranslations = async () => {
        const params = { language: locale.value, info: translations.value[locale.value] };
        await updateInterface(params);
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
        &__field {
            &:not(:last-child) {
                margin-bottom: 0.75rem;
            }
            label {
                display: block;
                color: $white;
                margin-bottom: 0.325rem;
            }
        }
    }
</style>