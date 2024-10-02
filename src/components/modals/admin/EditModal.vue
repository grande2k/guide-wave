<template>
    <teleport to="body">
        <div class="admin-modal modal">
            <div class="modal__content admin-modal__content scroll-parent black-scroll" ref="target">
                <div class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close" />
                </div>

                <h2 class="admin-modal__title" v-text="title" />

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

                    <div v-else-if="type === 'countries' || (type === 'backgrounds' && initialData?.country_code !== 'default')">
                        <div class="admin-modal__field">
                            <p>Двухзначный код страны:</p>
                            <input
                                type="text"
                                v-model="form_data.country_code"
                                placeholder="Например: ru, us"
                                maxlength="2"
                                :class="{ error: (type === 'countries' || type === 'backgrounds') && v$.country_code.$errors.length }" />
                        </div>
                    </div>

                    <div v-if="type === 'backgrounds'">
                        <div class="admin-modal__field" v-if="initialData?.country_code !== 'default'">
                            <p>Название локации на Русском:</p>
                            <input type="text" v-model="form_data.ru"
                                placeholder="Введите текст"
                                :class="{ error: v$.ru.$errors.length }" />
                        </div>

                        <div class="admin-modal__field">
                            <p>Фон:</p>
                            <span v-if="v$.background_image.$errors.length" class="form-error" style="margin-bottom: 0.5rem;">Загрузите изображение</span>
                            <admin-background-upload
                                :photo_url="initialData?.photo_url"
                                :only_jpg="initialData?.country_code === 'default'"
                                @upload="file => form_data.background_image = file"/>
                        </div>
                    </div>

                    <div v-else>
                        <div v-for="lang in appStore.interface_languages" :key="lang.lang_code" class="admin-modal__field">
                            <p>Перевод на {{ lang.name }}:</p>
                            <input type="text" v-model="form_data[lang.lang_code]"
                                placeholder="Введите текст"
                                :class="{ error: lang.lang_code === 'en' && v$.en.$errors.length }" />
                        </div>
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
    import { updateAdminLanguage, updateAdminService, updateCity, updateCountry, updateBackground } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';
    import AdminBackgroundUpload from '@/components/admin/AdminBackgroundUpload.vue';

    const toast = useToast();
    const target = ref(null);
    const appStore = useAppStore();
    const form_data = reactive({});

    const props = defineProps({
        title: String,
        type: String,
        initialData: Object,
        oldLangCode: String
    });

    const rules = computed(() => {
        const rules = {};
        if (props.type === 'backgrounds') {
            rules.country_code = { required };
            rules.ru = { required };
            rules.background_image = { required };
        } else {
            appStore.interface_languages.forEach((lang) => {
                if (lang.lang_code === 'en') rules[lang.lang_code] = { required };
                if (props.type === 'languages') rules.lang_code = { required };
                if (props.type === 'countries') rules.country_code = { required };
            });
        }
        return rules;
    });

    const v$ = useVuelidate(rules, form_data);

    watch(() => appStore.interface_languages, (newLangs) => {
        newLangs.forEach((lang) => {
            if(props.type === 'languages') {
                form_data[lang.lang_code] = props.initialData?.languages_names?.[lang.lang_code] || '';
            } else if(props.type === 'services') {
                form_data[lang.lang_code] = props.initialData?.services_name?.[lang.lang_code] || '';
            }  else if (props.type === 'countries') {
                form_data[lang.lang_code] = props.initialData?.country_names?.[lang.lang_code] || '';
            } else if(props.type === 'cities') {
                form_data[lang.lang_code] = props.initialData?.city_names?.[lang.lang_code] || '';
            } else if (props.type === 'backgrounds') {
                form_data.ru = props.initialData?.name || '';
                form_data.country_code = props.initialData?.country_code || '';
                form_data.background_image = props.initialData?.photo_url || '';
            }
        });

        if(props.type === 'languages') form_data.lang_code = props.initialData?.lang_code || '';
        if(props.type === 'countries') form_data.country_code = props.initialData?.country_code || '';
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
                const languages_formatted_data = {
                    old_lang_code: props.oldLangCode,
                    update_lang_code: form_data.lang_code,
                    languages_names: {}
                };

                appStore.interface_languages.forEach((lang) => {
                    languages_formatted_data.languages_names[lang.lang_code] = form_data[lang.lang_code];
                });

                await updateAdminLanguage(languages_formatted_data);
                break;
            case 'services':
                const services_formatted_data = {
                    old_services: props.initialData.services_name,
                    update_services: form_data
                };

                await updateAdminService(services_formatted_data);
                break;
            case 'countries':
                const countries_formatted_data = {
                    old_country_code: props.initialData.country_code,
                    new_country_code: form_data.country_code,
                    country_names: {}
                };

                appStore.interface_languages.forEach((lang) => {
                    countries_formatted_data.country_names[lang.lang_code] = form_data[lang.lang_code];
                });

                await updateCountry(countries_formatted_data);
            break;
            case 'cities':
                const cities_formatted_data = {
                    old_city_names: props.initialData.city_names,
                    new_city_names: form_data
                };

                await updateCity(cities_formatted_data);
                break;
            case 'backgrounds':
                const backgrounds_formatted_data = {
                    country_code_old: props.initialData.country_code,
                    country_code: form_data.country_code,
                    photo_url_old: props.initialData.photo_url,
                    name: form_data.ru
                };

                let fd;

                if(form_data.background_image !== props.initialData.photo_url) {
                    fd = new FormData();
                    fd.append('new_file', form_data.background_image, form_data.background_image.name);

                    await updateBackground(backgrounds_formatted_data, fd);
                } else {
                    await updateBackground(backgrounds_formatted_data);
                }
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
