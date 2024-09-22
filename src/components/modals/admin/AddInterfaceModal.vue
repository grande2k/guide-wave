<template>
    <teleport to="body">
        <div class="admin-modal modal admin-modal">
            <div class="modal__content admin-modal__content" ref="target">
                <div class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <h2 class="admin-modal__title">Новый язык</h2>

                <form @submit.prevent="submitForm">
                    <div class="admin-modal__field">
                        <p>Введите двухзначный код языка:</p>
                        <input type="text" v-model="form_data.lang_code" placeholder="Например: ru, en" maxlength="2"
                            :class="{ error: v$.lang_code.$errors.length }">
                    </div>

                    <div class="admin-modal__field">
                        <p>Введите название языка на русском:</p>
                        <input type="text" v-model="form_data.name" placeholder="Например: Русский, Английский"
                            :class="{ error: v$.name.$errors.length }">
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
    import { addInterfaceLanguage } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';

    const toast = useToast();
    const target = ref(null);

    const form_data = reactive({
        lang_code: "",
        name: ""
    });

    const rules = computed(() => {
        return {
            lang_code: { required },
            name: { required }
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const emit = defineEmits(['close', 'submitted']);

    onClickOutside(target, () => emit('close'));

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if (result) {
            await addInterfaceLanguage(form_data);
            emit('submitted');
            emit('close');
            clearForm();
            
        } else {
            toast.error('Заполните нужные поля');
        }
    }

    const clearForm = () => {
        form_data.lang_code = "";
        form_data.name = ""
    }
</script>