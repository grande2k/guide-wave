<template>
    <div class="admin-background-upload">
        <label for="photo" class="photo-upload">
            Выберите изображение
        </label>

        <div class="image">
            <img v-if="photo_url && !previewImage" :src="`https://guides-to-go.onrender.com${photo_url}`" alt="User photo" />
            <img v-if="previewImage" :src="previewImage" alt="Photo Preview" />
        </div>

        <input type="file" accept="image/*" id="photo" @change="onFileChange">
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    const props = defineProps({
        photo_url: {
            type: String,
            default: ''
        }
    });

    const emit = defineEmits(['upload']);

    const selected_image = ref(null);
    const previewImage = ref(null);

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.value = e.target.result;
            };
            reader.readAsDataURL(file);
            selected_image.value = file;
            uploadImage();
        } else {
            previewImage.value = null;
        }
    }

    const uploadImage = async () => {
        emit('upload', selected_image.value);
    }
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
    }
</style>