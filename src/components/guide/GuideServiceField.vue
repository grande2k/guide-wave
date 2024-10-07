<template>
    <div class="guide-profile__service delete">
        <span class="guide-profile__service-index" v-text="index + 1"/>

        <services-select
            :value="local_service"
            :error="error"
            :all_selected_services="all_selected_services"
            @choose="handleServiceSelect" />

        <input type="text" class="form-input service-price" :class="{ error: error }" placeholder="€"
            maxlength="5" v-model="local_service.price" @input="handlePriceInput" />

        <button type="button" class="delete-btn" @click="emit('delete')">
            <img src="@/assets/images/icons/delete.svg" alt="delete">
        </button>
    </div>

    <div class="guide-service__video">
        <div class="upload-element" v-if="is_changing || !video_url">
            <div class="flex">
                <label class="upload-btn" :for="`upload-video-${index}`">
                    <img src="@/assets/images/icons/upload.svg" alt="Upload">
                    {{ $t('choose_file') }}
                 </label>
        
                <p v-if="selected_video" class="video-title" v-text="selected_video.name"/>
            </div>

            <span class="video-tip">
                {{ `${$t('video_size_tip')} ${maxVideoSize} ${$t('mb')}` }}
                <br>
                {{ `${$t('video_duration_tip')} ${max_video_duration} ${$t('seconds')}` }}
                <br>
            </span>

            <input :id="`upload-video-${index}`" type="file" accept="video/*" @change="onFileChange" />
        </div>

        <div v-else class="video-buttons">
            <button type="button" class="video-watch" @click="is_watch_open = true">
                <img src="@/assets/images/icons/play.svg" alt="play">
                {{ $t('watch') }}
            </button>

            <button type="button" class="video-change" @click="changeVideo">
                <img src="@/assets/images/icons/edit.svg" alt="edit">
                {{ $t('edit') }}
            </button>

            <button type="button" class="video-delete" @click="deleteVideo">
                <img src="@/assets/images/icons/delete.svg" alt="delete">
                {{ $t('delete') }}
            </button>
        </div>
    </div>

    <video-modal
        v-if="is_watch_open"
        :video_url="video_url"
        @close="is_watch_open = false"
        @ended="is_watch_open = false"/>
</template>

<script setup>
    import { ref, computed, watch } from 'vue';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { validatePrice } from '@/utils/validatePrice';
    import axios from 'axios';
    import VideoModal from '@/components/modals/VideoModal.vue';
    import ServicesSelect from '@/components/ServicesSelect.vue';

    const { t } = useI18n();
    const toast = useToast();
    const emit = defineEmits(['update', 'delete', 'upload_video', 'update_video', 'delete_video']);

    const props = defineProps({
        value: {
            type: Object,
            default: { service_id: null, price: null },
        },
        video_url: {
            type: String,
            required: true
        },
        max_video_duration: {
            type: Number,
            required: true
        },
        index: Number,
        error: Boolean,
        all_selected_services: Array,
    });

    const local_service = ref({ ...props.value });

    watch(() => props.value, (newValue) => {
        local_service.value = { ...newValue };
    }, { deep: true });

    watch(() => props.video_url, (newVideo) => {
        if (newVideo) is_changing.value = false;
    });

    const selected_video = ref(null);
    const is_watch_open = ref(false);
    const is_changing = ref(false);

    const maxVideoSize = computed(() => props.max_video_duration * 1.5);

    const onFileChange = (event) => {
        const file = event.target.files[0];
        const maxFileSize = maxVideoSize.value * 1024 * 1024;

        if (file.size > maxFileSize) {
            toast.error(`${t('error_video_size')} ${maxFileSize} ${t('mb')}`);
            selected_video.value = null;
            event.target.value = '';
            return;
        }

        const videoElement = document.createElement('video');
        const videoURL = URL.createObjectURL(file);

        videoElement.addEventListener('loadedmetadata', () => {
            const videoDuration = Math.floor(videoElement.duration);
            const maxDuration = 15;

            if (videoDuration > maxDuration) {
                toast.error(`${t('error_video_duration')} ${props.max_video_duration} ${t('seconds')}`);
                selected_video.value = null;
                event.target.value = '';
                return;
            }

            selected_video.value = file;
            handleVideoAction();
        });

        videoElement.src = videoURL;
    }

    const handleVideoAction = async () => {
        if (!props.video_url || props.video_url === '') {
            emit('upload_video', { file: selected_video.value, service_id: local_service.value.service_id });
        } else if (props.video_url && is_changing.value) {
            emit('update_video', { file: selected_video.value, service_id: local_service.value.service_id });
        }
    }

    const changeVideo = () => {
        selected_video.value = null;
        is_changing.value = true;
    }

    const deleteVideo = async () => {
        try {
            const request_options = {
                params: { service_id: props.value.service_id , video_url: props.video_url },
                headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` }
            };

            const response = await axios.delete('https://guides-to-go.onrender.com/service/delete_video_service', request_options);
            console.log(response);
            emit('delete_video');
            toast.success(t('message_video_delete_success'));
        } catch (err) {
            toast.error(t('error_default'));
        }
    }

    const handleServiceSelect = (service_id) => {
        local_service.value.service_id = service_id;
        emit('update', { ...local_service.value });
    }

    const handlePriceInput = () => {
        const validPrice = validatePrice(local_service.value.price);

        if (validPrice === '') {
            local_service.value.price = 0;
        } else {
            local_service.value.price = validPrice;
        }

        emit('update', { ...local_service.value });
    }
</script>

<style lang="scss" scoped>
    .guide-profile__service {
        display: flex;
        margin-bottom: 0.5rem;
        min-height: 3.5rem;
        &-index {
            display: block;
            color: $white;
            font-weight: 500;
            padding-top: 1rem;
            margin-right: 0.5rem;
        }
        &.delete {
            .delete-btn {
                @include flex-center;
                background-color: $white;
                border-radius: 0.5rem;
                padding: 0.5rem;
                cursor: pointer;
                margin-left: 0.325rem;
                width: 3.5rem;
                img {
                    width: 1.5rem;
                    filter: invert(1);
                }
            }
            input.service-price {
                width: 17.5%;
            }
            .form-select {
                width: 67.5%;
                & > *:first-child {
                    height: 100%;
                    & > * {
                        height: 100%;
                    }
                }
            }
        }
        & > .form-select {
            flex: auto;
            margin-right: 0.325rem;
            text-transform: capitalize;
            margin-bottom: 0 !important;
            @media screen and (max-width: 480px) {
                height: auto;
            }
        }
        input.service-price {
            width: 17.5%;
            @media screen and (max-width: 480px) {
                height: auto;
            }
        }
    }

    .guide-service__video {
        padding-left: 1.125rem;
        padding-bottom: 1rem;
        input[type="file"] {
            width: 0.1px;
            height: 0.1px;
            position: absolute;
            z-index: -1;
            opacity: 0;
            visibility: hidden;
        }
        .flex {
            @include flex-center-vert;
            @media screen and (max-width: 480px) {
                flex-direction: column;
                align-items: stretch;
            }
        }
        .upload-btn {
            @include flex-center;
            background-color: $white;
            color: $black;
            padding: 1rem;
            border-radius: 0.5rem;
            width: fit-content;
            cursor: pointer;
            img {
                margin-right: 0.5rem;
                width: 1.25rem;
            }
            @media screen and (max-width: 480px) {
                width: 100%;
            }
        }
        .video-title {
            color: $white;
            margin: 0 0 0 1rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 60%;
            @media screen and (max-width: 480px) {
                width: 100%;
                max-width: 100%;
                margin: 0.5rem 0 0 0;
                align-self: start;
            }
        }
        .video-save {
            @include flex-center;
            position: relative;
            padding: 1rem;
            border-radius: 0.5rem;
            background-color: #1fda0e;
            color: $white;
            cursor: pointer;
            width: 100%;
            margin-top: 1rem;
            height: 3.25rem;
            .preloader {
                margin-right: 0.5rem;
                span {
                    width: 1.25rem;
                    height: 1.25rem;
                    border-width: 2px;
                }
            }
            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba($color: $black, $alpha: 0.325);
                border-radius: inherit;
                opacity: 0;
                transition: opacity 0.3s ease-in;
            }
            &.loading::after {
                opacity: 1;
            }
        }
        .video-buttons {
            @include grid(3, 0.25rem);
        }
        .video-watch {
            @include flex-center;
            border: 2px solid $white;
            color: $white;
            padding: 0.75rem;
            border-radius: 0.5rem;
            width: 100%;
            cursor: pointer;
            font-size: 0.75rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.25rem;
                font-size: 0.625rem;
            }
            img {
                margin-right: 0.375rem;
                width: 0.875rem;
                @media screen and (max-width: 480px) {
                    width: 0.75rem;
                }
            }
        }
        .video-change {
            @include flex-center;
            background-color: $dark;
            color: $white;
            padding: 0.75rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.75rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.25rem;
                font-size: 0.625rem;
            }
            img {
                margin-right: 0.25rem;
                width: 1rem;
                @media screen and (max-width: 480px) {
                    width: 0.875rem;
                }
            }
        }
        .video-delete {
            @include flex-center;
            background-color: #f50a0a;
            color: $white;
            padding: 0.75rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 0.75rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.25rem;
                font-size: 0.625rem;
            }
            img {
                margin-right: 0.25rem;
                width: 1.125rem;
                @media screen and (max-width: 480px) {
                    width: 1rem;
                }
            }
        }
        .video-tip {
            display: block;
            margin-top: 0.5rem;
            color: $white;
            line-height: 1.5;
            @media screen and (max-width: 480px) {
                font-size: 0.75rem;
            }
        }
    }
</style>