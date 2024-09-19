<template>
    <teleport to="body">
        <div class="video-modal modal">
            <div class="modal__content" ref="target">
                <div v-if="!close_disabled" class="modal__close" @click="emit('close')">
                    <img src="@/assets/images/icons/close.svg" alt="close">
                </div>

                <transition>
                    <div v-if="guide_name && isNameShown" class="guide-name">
                        <p v-text="guide_name"/>
                    </div>
                </transition>

                <video
                    class="video"
                    :src="`https://guides-to-go.onrender.com${video_url}`"
                    controls
                    autoplay
                    @ended="emit('ended')"/>
            </div>
        </div>
    </teleport>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';

    const target = ref(null);
    const isNameShown = ref(false);
    const emit = defineEmits(['close', 'ended']);

    const props = defineProps({
        video_url: {
            type: String,
            required: true
        },
        guide_name: {
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
</script>

<style lang="scss" scoped>
    .modal__content {
        max-width: 850px;
        width: auto;
        top: 1rem;
        background-color: transparent;
    }
    .video {
        display: block;
        max-height: 80vh;
        max-width: 100%;
        border-radius: inherit;
    }

    .guide-name {
        @include flex-center;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba($color: $black, $alpha: 0.75);
        p {
            font-weight: 500;
            margin: 0;
            color: $white;
            font-size: 1.25rem;
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