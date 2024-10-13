<template>
    <div class="admin-background-upload">
        <label v-if="(!photo_url && !previewImage) || showUploadButton" for="photo" class="photo-upload">
            Выберите изображение
        </label>

        <div class="image">
            <img v-if="photo_url && !previewImage && !showUploadButton"
                :src="`https://guides-to-go.onrender.com${photo_url}`" alt="User photo" />
            <img v-if="previewImage" :src="previewImage" alt="Photo Preview" />
        </div>

        <div v-if="!showUploadButton && photo_url && !previewImage" class="grid-half">
            <button class="change-background" @click="changeBackground">
                <img src="@/assets/images/icons/edit.svg" alt="edit">
                Изменить
            </button>

            <button class="delete-background" @click="deleteBackground">
                <img src="@/assets/images/icons/delete.svg" alt="delete">
                Удалить
            </button>
        </div>

        <div v-if="selected_image && previewImage" class="grid-half">
            <button class="change-background" @click="changeBackground">
                <img src="@/assets/images/icons/edit.svg" alt="edit">
                Изменить
            </button>

            <button class="delete-background" @click="deleteBackground">
                <img src="@/assets/images/icons/delete.svg" alt="delete">
                Удалить
            </button>
        </div>

        <button v-if="selected_image && previewImage" class="save-background" @click="updateImage">
            <img src="@/assets/images/icons/check.svg" alt="save">
            Сохранить
        </button>

        <input type="file" accept="image/jpeg" id="photo" @change="onFileChange">
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';

    const props = defineProps({
        photo_url: {
            type: String,
            default: ''
        }
    });

    const emit = defineEmits(['update']);

    const selected_image = ref(null);
    const previewImage = ref(null);
    const showUploadButton = ref(false);

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(file);
            selected_image.value = file;
            showUploadButton.value = false;
        }
    }

    const changeBackground = () => {
        previewImage.value = null;
        selected_image.value = null;
        showUploadButton.value = true;
    }

    const deleteBackground = () => {
        if (previewImage.value) {
            previewImage.value = null;
            selected_image.value = null;
        } else if (props.photo_url) {
            emit('update', null);
        }

        showUploadButton.value = true;
        selected_image.value = null;
        previewImage.value = null;
    }

    const updateImage = () => {
        emit('update', selected_image.value);
    }

    watch(() => props.photo_url, (newValue) => {
        if (!newValue) {
            previewImage.value = null;
            selected_image.value = null;
            showUploadButton.value = true;
        }
    });
</script>


<style lang="scss" scoped>
    .admin-background-upload {
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
        .grid-half {
            margin-top: 1rem;
            @include grid(2, 0.75rem);
        }
        button {
            @include flex-center;
            width: 100%;
            padding: 1.25rem;
            border-radius: 1rem;
            color: $white;
            font-weight: 500;
            font-size: 1rem;
            cursor: pointer;
            &.change-background {
                background-color: $primary;
            }
            &.delete-background {
                background-color: $error;
            }
            &.save-background {
                background-color: #48cc3c;
                margin-top: 1rem;
            }
            img {
                width: 1.5rem;
                margin-right: 0.5rem;
            }
        }
    }
</style>