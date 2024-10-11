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

                    <div class="admin-modal__field flag">
                        <label for="photo" class="photo-upload" :class="{ error: v$.icon.$errors.length }">
                            Выберите изображение
                        </label>

                        <div class="image">
                            <img v-if="previewImage" :src="previewImage" alt="Flag Preview" />
                        </div>

                        <input type="file" accept="image/svg+xml" id="photo" @change="onFileChange">

                        <span class="form-error" v-if="v$.icon.$errors.length">Загрузите флаг</span>
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

    const previewImage = ref(null);

    const form_data = reactive({
        lang_code: "",
        name: "",
        icon: null,
    });

    const rules = computed(() => {
        return {
            lang_code: { required },
            name: { required },
            icon: { required }
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const emit = defineEmits(['close', 'submitted']);

    onClickOutside(target, () => emit('close'));

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if (result) {
            form_data.lang_code = form_data.lang_code.trim().toLowerCase();
            form_data.name = form_data.name.trim();
            form_data.name = form_data.name.charAt(0).toUpperCase() + form_data.name.slice(1).toLowerCase();

            const fd = new FormData();
            fd.append('lang_code', form_data.lang_code);
            fd.append('languages_name', form_data.name);
            fd.append('file', form_data.icon, form_data.icon.name);

            await addInterfaceLanguage(fd);
            emit('submitted');
            emit('close');
            clearForm();
            
        } else {
            toast.error('Заполните нужные поля');
        }
    }

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(file);
            form_data.icon = file;
        } else {
            previewImage.value = null;
        }
    }

    const clearForm = () => {
        form_data.lang_code = "";
        form_data.name = "";
        form_data.icon = null;
    }
</script>

<style lang="scss" scoped>
    .flag {
        position: relative;
        input[type=file] {
            position: absolute;
            width: 0.1px;
            height: 0.1px;
            opacity: 0;
            visibility: hidden;
            z-index: -1;
        }
        .photo-upload {
            @include flex-center;
            max-width: 250px;
            background-color: $black;
            color: $white;
            padding: 1.25rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            &.error {
                background-color: $error;
            }
        }
        .image {
            margin-top: 1rem;
        }
    }
</style>