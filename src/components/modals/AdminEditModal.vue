<template>
    <teleport to="body">
        <div class="admin-edit modal">
            <div class="modal__content admin-edit__content" ref="target">
                <div class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <h2 class="admin-edit__title" v-text="content.title" />

                <form action="#" @submit.prevent="submitForm">
                    <div v-if="content.type === 'languages'" class="admin-edit__field">
                        <p>Введите двухзначный код языка:</p>
                        <input type="text" v-model="form_data.lang_code" placeholder="Например - ru, en"
                            :class="{ error: v$.lang_code.$errors.length }">
                    </div>

                    <div class="admin-edit__field">
                        <p>Введите значение на русском:</p>
                        <input type="text" v-model="form_data.ru" placeholder="Введите текст"
                            :class="{ error: v$.ru.$errors.length }">
                    </div>

                    <div class="admin-edit__field">
                        <p>Введите значение на английском:</p>
                        <input type="text" v-model="form_data.en" placeholder="Введите текст"
                            :class="{ error: v$.en.$errors.length }">
                    </div>

                    <submit-button blue text="save" icon="check" class="full-column" />
                </form>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, reactive, onMounted, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { onClickOutside } from '@vueuse/core';
    import SubmitButton from '../SubmitButton.vue';
    const toast = useToast();
    const target = ref(null);

    const props = defineProps({
        content: {
            type: Object,
            required: true,
            default: { title: '', type: '' }
        },
    });

    const form_data = reactive({
        old_lang_code: null,
        lang_code: null,
        ru: null,
        en: null,
        old_services: null,
    });

    onMounted(() => {
        if(props.content.type === 'languages') {
            form_data.old_lang_code = props.content.value.lang_code;
            form_data.lang_code = props.content.value.lang_code;
            form_data.ru = props.content.value.languages_names.ru;
            form_data.en = props.content.value.languages_names.en;
        } else if(props.content.type === 'services') {
            form_data.old_services = {
                en: props.content.value.services_name.en,
                ru: props.content.value.services_name.ru,
            };
            form_data.ru = props.content.value.services_name.ru;
            form_data.en = props.content.value.services_name.en;
        }
    });

    const rules = computed(() => {
        if (props.content.type === 'languages') {
            return {
                lang_code: { required },
                ru: { required },
                en: { required }
            }
        } else {
            return {
                ru: { required },
                en: { required }
            }
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const emit = defineEmits(['close', 'submitted']);

    onClickOutside(target, () => emit('close'));

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if (result) {
            emit('submitted', { type: props.content.type, data: form_data });
            v$.value.$touch();
            v$.value.$reset();
            clearForm();
            emit('close');
        } else {
            toast.error('Заполните нужные поля');
        }
    }

    const clearForm = () => {
        form_data.lang_code = null;
        form_data.old_lang_code = null;
        form_data.ru = null;
        form_data.en = null;
        form_data.old_services = null;
    }
</script>

<style lang="scss" scoped>
    .admin-edit {
        &__content {
            padding: 1.5rem;
        }
        &__title {
            text-align: center;
            margin: 0 0 1rem 0;
        }
        &__field {
            margin-bottom: 1.5rem;
            p {
                margin: 0 0 0.5rem 0;
            }
            input {
                display: block;
                padding: 1rem;
                color: $black;
                background-color: $white;
                border: 2px solid $black;
                border-radius: 0.5rem;
                width: 100%;
                outline: none;
                line-height: 1;
                &.error {
                    border-color: $error;
                }
                &:focus {
                    border-color: $primary;
                }
                &::placeholder {
                    color: #aaa;
                }
            }
        }
    }
</style>