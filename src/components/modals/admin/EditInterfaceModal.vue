<template>
    <teleport to="body">
        <div class="admin-modal modal admin-modal">
            <div class="modal__content admin-modal__content" ref="target">
                <div class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <h2 class="admin-modal__title">Редактировать {{ data.name }} язык</h2>

                <form @submit.prevent="submitForm">
                    <div class="admin-modal__field">
                        <p>Введите двухзначный код языка:</p>
                        <input type="text" v-model="form_data.new_lang_code" placeholder="Например: ru, en"
                            :class="{ error: v$.new_lang_code.$errors.length }">
                    </div>

                    <div class="admin-modal__field">
                        <p>Введите название языка на русском:</p>
                        <input type="text" v-model="form_data.new_lang_name" placeholder="Например: Русский, Английский"
                            :class="{ error: v$.new_lang_name.$errors.length }">
                    </div>

                    <div class="admin-modal__field flag">
                        <label for="photo" class="photo-upload">
                            Выберите изображение
                        </label>

                        <div class="image">
                            <img v-if="previewImage" :src="previewImage" alt="Flag Preview" />
                            <img v-else :src="`https://guides-to-go.onrender.com/flags/${data.lang_code}.svg`" alt="Flag" />
                        </div>

                        <input type="file" accept="image/svg+xml" id="photo" @change="onFileChange">
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
    import { useToast } from 'vue-toastification';
    import { onClickOutside } from '@vueuse/core';
    import { updateInterfaceLanguage } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';

    const toast = useToast();
    const target = ref(null);
    const previewImage = ref(null);

    const props = defineProps({
        data: {
            type: Object,
            required: true,
            default: { lang_code: "", name: "" }
        }
    });

    const form_data = reactive({
        old_lang_code: "",
        new_lang_code: "",
        new_lang_name: "",
        new_icon: null,
    });

    watch(() => props.data, (newData) => {
        if(newData) {
            form_data.old_lang_code = newData.lang_code;
            form_data.new_lang_code = newData.lang_code;
            form_data.new_lang_name = newData.name;
        }
    }, { immediate: true, deep: true });

    const rules = computed(() => {
        return {
            new_lang_code: { required },
            new_lang_name: { required }
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const emit = defineEmits(['close', 'submitted']);

    onClickOutside(target, () => emit('close'));

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if (result) {
            form_data.new_lang_code = form_data.new_lang_code.trim().toLowerCase();
            form_data.new_lang_name = form_data.new_lang_name.trim();
            form_data.new_lang_name = form_data.new_lang_name.charAt(0).toUpperCase() + form_data.new_lang_name.slice(1).toLowerCase();

            const fd = new FormData();
            fd.append('old_lang_code', form_data.old_lang_code);
            fd.append('update_lang_code', form_data.new_lang_code);
            fd.append('languages_name', form_data.new_lang_name);
            fd.append('file', form_data.new_icon, form_data.new_icon.name);

            await updateInterfaceLanguage(fd);

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
            form_data.new_icon = file;
        } else {
            previewImage.value = null;
        }
    }

    const clearForm = () => {
        form_data.old_lang_code = "";
        form_data.new_lang_code = "";
        form_data.new_lang_name = "";
        form_data.new_icon = null;
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
        }
        .image {
            margin-top: 1rem;
        }
    }
</style>