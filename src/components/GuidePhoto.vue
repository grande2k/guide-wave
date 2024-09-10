<template>
    <label for="guide-photo" class="guide-profile__photo">
        <div v-if="photo_url" class="guide-profile__photo-avatar">
            <img :src="`https://guides-to-go.onrender.com${photo_url}`" alt="User photo" />
        </div>
        <div v-if="previewImage" class="guide-profile__photo-preview">
            <img :src="previewImage" alt="Photo Preview" />
        </div>
        <div v-if="!photo_url" class="guide-profile__photo-add">
            <span>+</span>
            <p v-text="$t('profile.guide.upload_photo')"/>
        </div>
    </label>

    <input type="file" accept="image/*" id="guide-photo" @change="onFileChange">
</template>

<script setup>
    import { ref } from 'vue';
    import axios from 'axios';

    const props = defineProps({
        photo_url: {
            type: String,
            default: ''
        }
    });

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
        const fd = new FormData();
        fd.append('file', selected_image.value, selected_image.value.name);
        console.log(selected_image.value);
        const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
        const response = await axios.post('https://guides-to-go.onrender.com/user_info/add_photo', fd, request_headers);
        console.log(response);
    }
</script>

<style lang="scss" scoped>
    .guide-profile__photo {
        display: block;
        border-radius: 50%;
        width: 6.5rem;
        height: 6.5rem;
        position: relative;
        cursor: pointer;
        background-color: $secondary;
        border: 1px solid $white;
        &-preview,
        &-avatar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            border-radius: inherit;
            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: inherit;
                position: relative;
                z-index: 1;
            }
            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba($color: $black, $alpha: 0.325);
                z-index: 2;
                opacity: 0;
                transition: $transition;
                border-radius: 50%;
            }
            &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 2rem;
                height: 2rem;
                background-image: url('../assets/images/icons/edit.svg');
                background-repeat: no-repeat;
                background-size: contain;
                background-position: center;
                z-index: 3;
                opacity: 0;
                transition: $transition;
            }
            &:hover {
                &::before,
                &::after {
                    opacity: 1;
                }
            }
        }
        &-add {
            span {
                @include flex-center;
                font-family:'Courier New', Courier, monospace;
                line-height: 1;
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -45%);
                color: $white;
                font-size: 3rem;
                font-weight: 100;
                width: 1.75rem;
                height: 1.75rem;
                z-index: 1;
                @media screen and (max-width: 480px) {
                    font-size: 2rem;
                    width: 1rem;
                    height: 1rem;
                }
            }
            p {
                position: absolute;
                bottom: 0.625rem;
                left: 50%;
                transform: translateX(-50%);
                color: $white;
                text-align: center;
                font-size: 0.675rem;
                margin: 0;
                font-weight: 500;
                z-index: 1;
                @media screen and (max-width: 480px) {
                    font-size: 0.625rem;
                    bottom: 0.325rem;   
                }
            }
        }
        @media screen and (max-width: 480px) {
            width: 5rem;
            height: 5rem;
            margin: 0 auto -0.625rem auto;
        }
    }

    #guide-photo {
        width: 0.1px;
        height: 0.1px;
        visibility: hidden;
        opacity: 0;
        position: relative;
        z-index: -1;
    }
</style>