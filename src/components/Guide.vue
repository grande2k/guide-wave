<template>
    <div class="guide" v-if="guide">
        <div class="guide__flex">
            <div class="guide__photo">
                <div v-if="guide.photo_url" class="guide__photo-avatar">
                    <img :src="`https://guides-to-go.onrender.com${guide.photo_url}`" alt="User photo" />
                </div>

                <div v-else class="guide__photo-empty">
                    <img src="@/assets/images/icons/user.svg" alt="User photo" />
                </div>
            </div>

            <div class="guide__info">
                <p class="guide__name" v-text="guide.name"/>

                <button type="button" class="guide__btn video" @click="is_video_shown = true">
                    <img src="@/assets/images/icons/play.svg" alt="play">
                    {{ $t('video_card') }}
                </button>

                <div class="grid-half">
                    <button
                        type="button"
                        class="guide__btn whatsapp"
                        :class="{ disabled: isDisabled }"
                        @click="handleCall('whatsapp')"
                        :disabled="isDisabled">
                        <img src="@/assets/images/icons/whatsapp.svg" alt="whatsapp icon" />
                        Whatsapp
                    </button>

                    <a
                        :href="`tel:${guide.phone}`"
                        class="guide__btn call"
                        :class="{ disabled: isDisabled }"
                        @click="handleCall('phone')"
                        :disabled="isDisabled">
                        <img src="@/assets/images/icons/call.svg" alt="call" />
                        {{ $t('call') }}
                    </a>
                </div>
            </div>
        </div>

        <calendar v-if="guide.calendar" :dates="guide.calendar"/>
    </div>

    <video-modal 
        v-if="is_video_shown"
        :guide_name="guide.name"
        :video_url="guide.video_url"
        @close="is_video_shown = false"
        @ended="is_video_shown = false"/>
</template>

<script setup>
    import { ref } from 'vue';
    import { addCallsCount } from '@/api';
    import { useI18n } from 'vue-i18n';
    import Calendar from '@/components/Calendar.vue';
    import VideoModal from '@/components/modals/VideoModal.vue';

    const { t } = useI18n();

    const emit = defineEmits(['callMade']);

    const props = defineProps({
        guide: {
            type: Object,
            required: true
        }
    });

    const isDisabled = ref(false);
    const is_video_shown = ref(false);

    const handleCall = async (source) => {
        if (isDisabled.value) return;

        if(source === 'whatsapp') window.open(`https://wa.me/${props.guide.phone.slice(1)}`, '_blank');

        const params = { user_id: props.guide.user_id };
        await addCallsCount(params, t);

        isDisabled.value = true;
        emit('callMade');
    }
</script>

<style lang="scss" scoped>
    .guide {
        &__flex {
            display: flex;
        }
        &:not(:last-child) {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba($color: $white, $alpha: 0.75);
            @media screen and (max-width: 480px) {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
            }
        }
        &__photo {
            position: relative;
            width: 8rem;
            min-width: 8rem;
            height: 8rem;
            border-radius: 50%;
            border: 2px solid $white;
            margin-right: 2rem;
            @media screen and (max-width: 480px) {
                min-width: 6rem;
                width: 6rem;
                height: 6rem;
                margin-right: 1.25rem;
            }
            &-avatar {
                width: 100%;
                height: 100%;
                border-radius: inherit;
                img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    border-radius: inherit;
                    object-fit: cover;
                    object-position: center;
                }
            }
            &-empty {
                @include flex-center;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: $white;
                img {
                    display: block;
                    width: 4rem;
                    @media screen and (max-width: 480px) {
                        width: 3rem;
                    }
                }
            }
        }
        &__info {
            flex: auto;
        }
        &__name {
            font-size: 1.75rem;
            color: $white;
            font-weight: bold;
            margin: 0 0 1rem 0;
            @media screen and (max-width: 480px) {
                font-size: 1.325rem;
                margin-bottom: 0.75rem;
            }
        }
        .grid-half {
            @include grid(2, 0.5rem);
            @media screen and (max-width: 480px) {
                grid-template-columns: 1fr;
                grid-gap: 0.75rem;
            }
        }
        &__btn {
            @include flex-center;
            text-decoration: none;
            border-radius: 1rem;
            padding: 1rem;
            width: 100%;
            font-weight: 500;
            max-width: 200px;
            font-size: 1.125rem;
            cursor: pointer;
            user-select: none;
            text-decoration: none;
            &.video {
                border: 2px solid $white;
                color: $white;
                max-width: 100%;
                margin-bottom: 0.5rem;
                @media screen and (max-width: 480px) {
                    max-width: 200px;
                    img {
                        width: 1rem;
                    }
                }
            }
            &.whatsapp {
                background-color: #25d366;
                color: $white;
            }
            &.call {
                background-color: $white;
                color: $black;
            }
            &.disabled  {
                background-color: #ccc;
                pointer-events: none;
                cursor: not-allowed;
            }
            @media screen and (max-width: 480px) {
                font-size: 1rem;
                padding: 0.75rem;
                border-radius: 0.75rem;
            }
            img {
                width: 1.5rem;
                margin-right: 0.75rem;
                @media screen and (max-width: 480px) {
                    width: 1.25rem;
                    margin-right: 0.5rem;
                }
            }
        }
    }
</style>