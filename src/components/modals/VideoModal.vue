<template>
    <teleport to="body">
        <div class="video-modal modal">
            <div class="modal__content" ref="target">
                <div v-if="!close_disabled" class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <transition>
                    <div v-if="guide_name && isNameShown" class="guide-name">
                        <p>
                            <span v-if="guide_index" v-text="guide_index"/>
                            <br v-if="guide_index">
                            {{ guide_name }}
                        </p>
                    </div>
                </transition>

                <video
                    class="video"
                    ref="videoRef"
                    :src="`https://guides-to-go.onrender.com${video_url}`"
                    autoplay
                    playsinline
                    @timeupdate="updateProgress"
                    @loadedmetadata="setVideoDuration"
                    @ended="emit('ended')"/>

                <div class="video-controls">
                    <div class="video-timing">
                        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
                    </div>

                    <div class="progress-container">
                        <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';

    const target = ref(null);
    const videoRef = ref(null);
    const isNameShown = ref(false);
    const emit = defineEmits(['close', 'ended']);
    const currentTime = ref(0);
    const duration = ref(0);
    const progress = ref(0);

    const props = defineProps({
        video_url: {
            type: String,
            required: true
        },
        guide_name: {
            type: String,
            default: ''
        },
        guide_index: {
            type: String,
            default: ''
        },
        close_disabled: {
            type: Boolean,
            default: false
        }
    });

    watch(() => props.guide_name, (newName) => {
        if(newName) {
            isNameShown.value = true;
            setTimeout(() => {
               isNameShown.value = false; 
            }, 2000);
        }
    }, { immediate: true });

    onClickOutside(target, () => {
        if (!props.close_disabled) emit('close');
    });

    const updateProgress = () => {
        if (videoRef.value) {
            currentTime.value = videoRef.value.currentTime;
            progress.value = (currentTime.value / duration.value) * 100; // Обновление прогресса
        }
    }

    const setVideoDuration = () => {
        if (videoRef.value) {
            duration.value = videoRef.value.duration;
        }
    }

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
</script>

<style lang="scss" scoped>
    .video-modal {
        position: fixed;
        overflow: hidden;
    }
    .modal__content {
        max-width: 850px;
        width: auto;
        top: 1rem;
        background-color: transparent;
        @media screen and (max-width: 480px) {
            top: 0;
        }
    }
    .video {
        display: block;
        max-height: 80vh;
        max-width: 100%;
        border-radius: inherit;
        -webkit-appearance: none;
        appearance: none;
        @media screen and (max-width: 480px) {
            max-height: 80dvh;
        }
    }

    .guide-name {
        @include flex-center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba($color: $black, $alpha: 0.25);
        p {
            font-weight: 500;
            margin: 0;
            color: $white;
            font-size: 1.325rem;
            padding: 1rem;
            background-color: $primary;
            border-radius: 0.5rem;
            text-align: center;
        }
    }

    .video-controls {
        position: absolute;
        width: 95%;
        left: 50%;
        bottom: 1rem;
        transform: translateX(-50%);
    }

    .video-timing {
        text-align: center;
        margin-top: 5px;
        color: $white;
        font-size: 0.875rem;
    }

    .progress-container {
        width: 100%;
        height: 0.5rem;
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 0.25rem;
        overflow: hidden;
        margin-top: 0.5rem;
    }

    .progress-bar {
        height: 100%;
        background-color: $white;
        transition: width 0.2s;
    }

    .v-enter-active,
    .v-leave-active {
        transition: opacity 0.5s ease;
    }

    .v-enter-from,
    .v-leave-to {
        opacity: 0;
    }
</style>