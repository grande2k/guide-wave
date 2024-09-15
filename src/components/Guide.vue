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

                <button
                    type="button"
                    class="guide__call"
                    :class="{ disabled: isDisabled }"
                    @click="handleCall"
                    :disabled="isDisabled">
                    <img src="@/assets/images/icons/whatsapp.svg" alt="whatsapp icon" />
                    {{ $t('call') }}
                </button>
            </div>
        </div>

        <calendar v-if="guide.calendar" :dates="guide.calendar"/>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { addCallsCount } from '@/api';
    import { useI18n } from 'vue-i18n';
    import Calendar from '@/components/Calendar.vue';

    const { t } = useI18n();

    const emit = defineEmits(['callMade']);

    const props = defineProps({
        guide: {
            type: Object,
            required: true
        }
    });

    const isDisabled = ref(false);

    const handleCall = async (index) => {
        if (isDisabled.value) return;

        const params = { user_id: props.guide.user_id };
        await addCallsCount(params, t);
        window.open(`https://wa.me/${props.guide.phone.slice(1)}`, '_blank').focus();
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
        &__call {
            @include flex-center;
            text-decoration: none;
            border-radius: 1rem;
            padding: 1rem;
            background-color: #25d366;
            color: $white;
            width: 100%;
            font-weight: 500;
            max-width: 200px;
            font-size: 1.125rem;
            cursor: pointer;
            user-select: none;
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