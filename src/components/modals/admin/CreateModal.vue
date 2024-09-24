<template>
    <teleport to="body">
        <div class="admin-modal modal">
            <div class="modal__content admin-modal__content scroll-parent black-scroll" ref="target">
                <div class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close" />
                </div>

                <h2 class="admin-modal__title" v-text="title"/>

                <form @submit.prevent="submitForm">
                    <div v-if="type === 'languages'">
                        <div class="admin-modal__field">
                            <p>Двухзначный код языка:</p>
                            <input
                                type="text"
                                v-model="form_data.lang_code"
                                placeholder="Например: ru, en"
                                maxlength="2"
                                :class="{ error: type === 'languages' && v$.lang_code.$errors.length }" />
                        </div>
                    </div>

                    <div v-else-if="type === 'countries'">
                        <div class="admin-modal__field">
                            <p>Двухзначный код страны:</p>
                            <input
                                type="text"
                                v-model="form_data.country_code"
                                placeholder="Например: ru, us"
                                maxlength="2"
                                :class="{ error: type === 'countries' && v$.country_code.$errors.length }" />
                        </div>
                    </div>

                    <div v-for="lang in appStore.interface_languages" :key="lang.lang_code" class="admin-modal__field">
                        <p>Перевод на {{ lang.name }}:</p>
                        <input type="text" v-model="form_data[lang.lang_code]"
                            placeholder="Введите текст"
                            :class="{ error: lang.lang_code === 'en' && v$.en.$errors.length }" />
                    </div>

                    <submit-button blue text="save" icon="check" class="full-column" />
                </form>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, reactive, computed, watch } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators';
    import { useAppStore } from '@/stores/app';
    import { useToast } from 'vue-toastification';
    import { onClickOutside } from '@vueuse/core';
    import { addAdminLanguage, addAdminService, addCity, addCountry } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';

    const toast = useToast();
    const target = ref(null);

    const appStore = useAppStore();
    const form_data = reactive({});
    
    const props = defineProps({
        title: String,
        type: String,
        country_id: Number
    });

    const rules = computed(() => {
        const rules = {};
        appStore.interface_languages.forEach((lang) => {
            if(lang.lang_code === 'en') rules[lang.lang_code] = { required };
            if(props.type === 'languages') rules.lang_code = { required };
            if (props.type === 'countries') rules.country_code = { required };
        });
        return rules;
    });

    const v$ = useVuelidate(rules, form_data);

    watch(() => appStore.interface_languages, (newLangs) => {
        newLangs.forEach((lang) => {
            form_data[lang.lang_code] = null;
        });
    }, { immediate: true });

    const emit = defineEmits(['close', 'submitted']);

    onClickOutside(target, () => emit('close'));

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if (result) {
            await handleSubmit(props.type);
            clearForm();
            emit('submitted');
            emit('close');
        } else {
            toast.error('Заполните нужные поля');
        }
    }

    const handleSubmit = async (source) => {
        switch (source) {
            case 'languages':
                const langs_formatted_data = {
                    lang_code: form_data.lang_code,
                    languages_names: {}
                };

                appStore.interface_languages.forEach((lang) => {
                    langs_formatted_data.languages_names[lang.lang_code] = form_data[lang.lang_code];
                });

                await addAdminLanguage(langs_formatted_data);
                break;
            case 'services':
                const services_formatted_data = {
                    services_name: {}
                };

                appStore.interface_languages.forEach((lang) => {
                    services_formatted_data.services_name[lang.lang_code] = form_data[lang.lang_code];
                });

                await addAdminService(services_formatted_data);
                break;
            case 'countries':
                const countries_formatted_data = {
                    country_code: form_data.country_code,
                    country_names: {}
                };

                appStore.interface_languages.forEach((lang) => {
                    countries_formatted_data.country_names[lang.lang_code] = form_data[lang.lang_code];
                });

                await addCountry(countries_formatted_data);
                break;
            case 'cities':
                const cities_formatted_data = {
                    country_id: props.country_id,
                    city_names: {}
                };

                appStore.interface_languages.forEach((lang) => {
                    cities_formatted_data.city_names[lang.lang_code] = form_data[lang.lang_code];
                });

                await addCity(cities_formatted_data);
                break;
            default:
                break;
        }
    }

    const clearForm = () => {
        appStore.interface_languages.forEach((lang) => {
            form_data[lang.lang_code] = null;
        });
    }
</script>