<template>
    <teleport to="body">
        <div class="video-modal modal">
            <div class="modal__content" ref="target">
                <div v-if="!close_disabled" class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <div class="video-wrapper">
                    <transition>
                        <div v-if="guide_name && isNameShown" class="guide-name">
                            <p v-text="guide_name"/>
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
                </div>

                <div class="video-controls" v-if="guide_index && guides_count">
                    <div 
                        v-for="(circle, index) in guides_count" 
                        :key="index" 
                        :class="['circle', { active: guide_index === index + 1 }]">
                        <span v-if="guide_index === index + 1" v-text="formatTime(countdown)"/>
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
    const countdown = ref(0);

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
            type: Number,
        },
        guides_count: {
            type: Number
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
            countdown.value = Math.max(0, Math.floor(duration.value - currentTime.value));
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
    .video-wrapper {
        position: relative;
        border-radius: inherit;
        width: fit-content;
        margin: 0 auto;
    }
    .video {
        display: block;
        max-height: 70vh;
        max-width: 100%;
        border-radius: inherit;
        -webkit-appearance: none;
        appearance: none;
        margin: 0 auto;
        @media screen and (max-width: 480px) {
            max-height: 75dvh;
        }
    }

    .guide-name {
        @include flex-center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        max-height: 70vh;
        height: 100%;
        background-color: rgba($color: $white, $alpha: 0.25);
        border-radius: inherit;
        @media screen and (max-width: 480px) {
            max-height: 75dvh;
        }
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
        @include flex-center;
        gap: 1rem;
        margin-top: 2rem;
        @media screen and (max-width: 480px) {
            margin-top: 1rem;
        }
        .circle {
            @include flex-center;
            width: 3.5rem;
            height: 3.5rem;
            min-width: 3.5rem;
            border-radius: 50%;
            background-color: rgba($color: $white, $alpha: 0.25);
            @media screen and (max-width: 480px) {
                width: 4rem;
                height: 4rem;
                min-width: 4rem;
                font-size: 1rem;
            }
            &.active {
                background-color: $primary;
                line-height: 1;
                color: $white;
            }
        }
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