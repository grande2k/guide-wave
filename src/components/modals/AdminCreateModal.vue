<template>
    <teleport to="body">
        <div class="admin-create modal">
            <div class="modal__content admin-create__content" ref="target">
                <div class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <h2 class="admin-create__title" v-text="title"/>

                <form action="#" @submit.prevent="submitForm">
                    <div v-if="type === 'languages'" class="admin-create__field">
                        <p>Введите двухзначный код языка:</p>
                        <input type="text" v-model="form_data.lang_code" placeholder="Например - ru, en" :class="{ error: v$.lang_code.$errors.length }">
                    </div>

                    <div class="admin-create__field">
                        <p>Введите значение на русском:</p>
                        <input type="text" v-model="form_data.ru" placeholder="Введите текст" :class="{ error: v$.ru.$errors.length }">
                    </div>

                    <div class="admin-create__field">
                        <p>Введите значение на английском:</p>
                        <input type="text" v-model="form_data.en" placeholder="Введите текст" :class="{ error: v$.ru.$errors.length }">
                    </div>

                    <submit-button blue text="save" icon="check" class="full-column" />
                </form>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { onClickOutside } from '@vueuse/core';
    import SubmitButton from '../SubmitButton.vue';

    const toast = useToast();
    const target = ref(null);

    const props = defineProps({
        type: {
            type: String,
            required: true,
            default: ''
        },
        title: {
            type: String,
            required: true,
            default: ''
        },
    });

    const form_data = reactive({
        lang_code: null,
        ru: null,
        en: null,
    });

    const rules = computed(() => {
        if(props.type === 'languages') {
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

        if(result) {
            emit('submitted', { type: props.type, data: form_data });
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
        form_data.ru = null;
        form_data.en = null;
    }
</script>

<style lang="scss" scoped>
    .admin-create {
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