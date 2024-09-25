<template>
    <div class="guide-profile__video full-column">
        <h2 class="form-label" v-text="$t('video')"/>

        <div class="upload-element" v-if="is_changing || !video_url">
            <div class="flex">
                <label class="upload-btn" for="upload-video">
                    <img src="@/assets/images/icons/upload.svg" alt="Upload">
                    {{ $t('choose_file') }}
                </label>
            
                <p v-if="selected_video" class="video-title" v-text="selected_video.name"/>
            </div>

            <span class="video-tip">
                {{ `${ $t('video_size_tip') } ${maxVideoSize} ${$t('mb')}` }}
                <br>
                {{ `${$t('video_duration_tip')} ${max_video_duration} ${$t('seconds')}` }}
                <br>
            </span>

            <button v-if="selected_video" type="button" class="video-save" :class="{ 'loading': is_uploading }" @click="uploadVideo">
                <div v-if="is_uploading" class="preloader"><span></span></div>
                {{ $t('upload') }}
            </button>

            <input id="upload-video" type="file" accept="video/*" @change="onFileChange" />
        </div>

        <div v-else>
            <button type="button" class="video-watch" @click="is_watch_open = true">
                <img src="@/assets/images/icons/play.svg" alt="play">
                {{ $t('watch') }}
            </button>

            <div class="grid-half">
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
    </div>

    <video-modal
        v-if="is_watch_open"
        :video_url="video_url"
        @close="is_watch_open = false"
        @ended="is_watch_open = false"/>
</template>

<script setup>
    import { ref, computed } from 'vue';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import axios from 'axios';
    import VideoModal from '@/components/modals/VideoModal.vue';

    const toast = useToast();
    const { t } = useI18n();

    const props = defineProps({
        video_url: {
            type: String,
            required: true
        },
        max_video_duration: {
            type: Number,
            required: true
        }
    });

    const emit = defineEmits(['deleted', 'updated']);

    const selected_video = ref(null);
    const is_watch_open = ref(false);
    const is_uploading = ref(false);
    const is_changing = ref(false);

    const maxVideoSize = computed(() => props.max_video_duration * 1.5);
    
    const onFileChange = (event) => {
        const file = event.target.files[0];
        const maxFileSize = maxVideoSize.value * 1024 * 1024;

        if (file.size > maxFileSize) {
            toast.error(`${t('error_video_size')} ${maxFileSize.value} ${t('mb')}`);
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
            console.log(selected_video.value);
        });

        videoElement.src = videoURL;
    }

    const uploadVideo = async () => {
        const fd = new FormData();
        console.log(selected_video.value);
        try {
            let response;
            is_uploading.value = true;
            if(!props.video_url || props.video_url === '') {
                const add_request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
                fd.append('file', selected_video.value, selected_video.value.name);
                response = await axios.post('https://guides-to-go.onrender.com/user_info/add_video', fd, add_request_headers);
            } else if(props.video_url && is_changing.value) {
                const update_request_headers = { params: { old_video_url: props.video_url }, headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
                fd.append('new_file', selected_video.value, selected_video.value.name);
                response = await axios.put('https://guides-to-go.onrender.com/user_info/update_video', fd, update_request_headers);
            }
            console.log(response);
            is_uploading.value = false;
            is_changing.value = false;
            toast.success(t('message_video_upload_success'));
            emit('updated');
        } catch(err) {
            is_uploading.value = false;
            is_changing.value = false;
            toast.error(t('error_default'));
        }
    }

    const changeVideo = () => {
        selected_video.value = null;
        is_changing.value = true;
    }

    const deleteVideo = async () => {
        try {
            const request_options = {
                params: { video_url: props.video_url },
                headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` }
            };

            const response = await axios.delete('https://guides-to-go.onrender.com/user_info/delete_video', request_options);
            console.log(response);
            emit('deleted');
            toast.success(t('message_video_delete_success'));
        } catch (err) {
            toast.error(t('error_default'));
        }
    }
</script>

<style lang="scss" scoped>
    .guide-profile__video {
        grid-column: 1 / 3;
        .form-label {
            text-align: center;
            justify-content: center;
        }
        .flex {
            @include flex-center-vert;
            @media screen and (max-width: 480px) {
                flex-direction: column;
                align-items: stretch;
            }
        }
        #upload-video {
            width: 0.1px;
            height: 0.1px;
            position: absolute;
            z-index: -1;
            opacity: 0;
            visibility: hidden;
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
        .video-watch {
            @include flex-center;
            border: 2px solid $white;
            color: $white;
            padding: 1rem;
            border-radius: 0.5rem;
            width: 100%;
            cursor: pointer;
            img {
                margin-right: 0.5rem;
                width: 1.5rem;
            }
        }
        .grid-half {
            @include grid(2, 0.5rem);
            margin-top: 0.5rem;
        }
        .video-change {
            @include flex-center;
            background-color: $dark;
            color: $white;
            padding: 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            img {
                margin-right: 0.25rem;
                width: 1.5rem;
            }
        }
        .video-delete {
            @include flex-center;
            background-color: #f50a0a;
            color: $white;
            padding: 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            img {
                margin-right: 0.25rem;
                width: 1.5rem;
            }
        }
        .video-tip {
            display: block;
            margin-top: 0.5rem;
            color: $white;
            line-height: 1.5;
        }
    }
</style>