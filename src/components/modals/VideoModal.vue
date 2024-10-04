<template>
    <teleport to="body">
        <div class="video-modal modal">
            <div class="modal__content" ref="target">
                <div v-if="!close_disabled" class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <div class="video-wrapper" ref="swiper">
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
            </div>

            <div class="video-controls" v-if="guide_index && guides_count" ref="videoControlsRef" :class="{ 'flex-start': isScrollable }">
                <div 
                    v-for="(circle, index) in guides_count" 
                    :key="index" 
                    :class="['circle', { active: guide_index === index + 1 }]"
                    :ref="el => circleRefs[index] = el"
                    @click="emit('switch', index)">
                    <span v-if="guide_index === index + 1" v-text="formatTime(countdown)"/>
                    <span v-else v-text="index + 1"/>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { onClickOutside, useSwipe } from '@vueuse/core';
    import { useAppStore } from '@/stores/app';

    const appStore = useAppStore();
    const target = ref(null);
    const videoRef = ref(null);
    const isNameShown = ref(false);
    const swiper = ref(false);
    const circleRefs = ref([]);
    const videoControlsRef = ref(null);
    const isScrollable = ref(false);
    const emit = defineEmits(['close', 'ended', 'switch']);
    const currentTime = ref(0);
    const duration = ref(0);
    const max_duration = ref(appStore.max_video_duration);
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

    watch(() => props.guide_index, (newIndex) => {
        if (circleRefs.value[newIndex - 1]) {
            circleRefs.value[newIndex - 1].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    });

    watch(() => videoControlsRef.value, (newVal) => {
        if (newVal) {
            const controlsEl = videoControlsRef.value;
            const isContentOverflowing = controlsEl.scrollWidth > controlsEl.clientWidth;
            isScrollable.value = isContentOverflowing;
        }
    }, { immediate: true });

    watch(() => props.guide_name, (newName) => {
        if(newName) {
            isNameShown.value = true;
            setTimeout(() => {
               isNameShown.value = false; 
            }, 2000);
        }
    }, { immediate: true });

    watch(() => appStore.max_video_duration, (newDuration) => {
        if(newDuration) max_duration.value = newDuration;
    });

    onClickOutside(target, () => {
        if (!props.close_disabled) emit('close');
    });

    const swipe_result = ref(null);

    const { direction, lengthX } = useSwipe(
        target,
        {
            passive: true,
            onSwipe() {
                const screenWidth = window.innerWidth;
                if( direction.value === "left" && lengthX.value > (screenWidth / 3)  ) {
                    swipe_result.value = "next";
                } else if ( direction.value === "right" && Math.abs(lengthX.value) > (screenWidth / 3)) {
                    swipe_result.value = "prev";
                }
            },
            onSwipeEnd() {
                switch (swipe_result.value) {
                    case "next":
                        if(props.guide_index < props.guides_count) emit("ended");
                        break;
                    case "prev":
                        if(props.guide_index > 1) emit("switch", props.guide_index - 2);
                        break;
                    default:
                        break;
                };

                swipe_result.value = null;
            },
        },
    )

    const updateProgress = () => {
        if (videoRef.value && max_duration.value) {
            currentTime.value = videoRef.value.currentTime;
            const effectiveDuration = Math.min(duration.value, max_duration.value);
            countdown.value = Math.max(0, Math.floor(effectiveDuration - currentTime.value));

            if (Math.round(currentTime.value) >= max_duration.value) {
                emit('ended');
            }
        }
    }

    const setVideoDuration = () => {
        if (videoRef.value && max_duration.value) {
            duration.value = videoRef.value.duration;
            const effectiveDuration = Math.min(duration.value, max_duration.value);
            countdown.value = Math.floor(effectiveDuration);
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
        padding: 1rem 0;
        position: fixed;
        overflow: hidden;
    }
    .modal__content {
        max-width: 850px;
        width: 100%;
        top: -1rem;
        background-color: transparent;
        z-index: 2;
        @media screen and (max-width: 480px) {
            top: -2.25rem;
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
        display: flex;
        padding: 0 0.875rem;
        position: absolute;
        z-index: 3;
        bottom: 4rem;
        left: 0;
        gap: 1rem;
        width: 100%;
        overflow-x: auto;
        justify-content: center;
        &.flex-start {
            justify-content: flex-start;
        }
        @media screen and (max-width: 480px) {
            bottom: 2rem;
            // justify-content: flex-start;
        }
        .circle {
            @include flex-center;
            width: 3.5rem;
            height: 3.5rem;
            min-width: 3.5rem;
            border-radius: 50%;
            background-color: rgba($color: $white, $alpha: 0.25);
            color: rgba($color: $white, $alpha: 0.5);
            line-height: 1;
            cursor: pointer;
            user-select: none;
            @media screen and (max-width: 480px) {
                width: 4rem;
                height: 4rem;
                min-width: 4rem;
                font-size: 1rem;
            }
            &.active {
                background-color: $primary;
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