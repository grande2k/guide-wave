<template>
    <div class="admin-duration" v-if="video_duration">
        <h2 class="admin-duration__title">Длительность видео-визиток:</h2>

        <div class="admin-duration__content">
            <button class="admin-duration__button" @click="handleDurationUpdate('-')">-</button>
            <span class="admin-duration__count" v-text="video_duration + ' секунд'" />
            <button class="admin-duration__button" @click="handleDurationUpdate('+')">+</button>
        </div>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { updateDuration } from '@/api';
    import { useAppStore } from '@/stores/app';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const appStore = useAppStore();
    const video_duration = ref(appStore.max_video_duration);

    watch(() => appStore.max_video_duration, (newDuration) => {
        if(newDuration) video_duration.value = newDuration;
    }, { immediate: true });

    const handleDurationUpdate = async (action) => {
        if (video_duration.value > 1) {
            if (action === '-') {
                video_duration.value--;
            } else {
                video_duration.value++;
            }
        }

        const params = { time_video: video_duration.value };
        await updateDuration(params, t);
        appStore.setMaxVideoDuration(video_duration.value);
    }
</script>

<style lang="scss" scoped>
    .admin-duration {
        margin-bottom: 2rem;

        &__title {
            color: $white;
            margin: 0 0 1rem 0;
            text-align: center;
            line-height: 1;
        }

        &__content {
            @include flex-center;
        }

        &__button {
            @include flex-center;
            font-family: 'Courier New', Courier, monospace;
            width: 2.5rem;
            height: 2.5rem;
            min-width: 2.5rem;
            border-radius: 50%;
            background-color: $white;
            color: $primary;
            line-height: 1;
            cursor: pointer;
            font-weight: bold;
            padding-top: 0.25rem;

            &:first-child {
                font-size: 2rem;
            }

            &:last-child {
                font-size: 1.75rem;
            }
        }

        &__count {
            margin: 0 1rem;
            color: $white;
            font-size: 1.25rem;
        }
    }
</style>