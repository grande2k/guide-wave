<template>
    <button class="guide-profile__status" :class="{ 'guide-profile__status--off': !status_value }" @click="updateStatus()">
        <span/>

        <p>
            {{ status_value ? $t('profile.guide.status.on') : $t('profile.guide.status.off') }}
        </p>
    </button>
</template>

<script setup>
    import { watch } from 'vue';
    import { useToggle } from '@vueuse/core';
    import axios from 'axios';

    const [status_value, toggleStatus] = useToggle();

    const props = defineProps({
        status: {
            type: Boolean,
            required: true,
        }
    });

    watch(() => props.status, (newStatus) => {
        status_value.value = newStatus;
    }, { immediate: true });

    const updateStatus = async () => {
        toggleStatus();

        try {
            const params = { status: status_value.value };
            const request_headers = { headers: { 'Authorization': `Bearer ${$cookies.get("access_token")}` } };
            const response = await axios.post('https://guides-to-go.onrender.com/user_info/status', params, request_headers);
            console.log(response.data);
        } catch(err) {
            console.log(err);
        }

    }
</script>

<style lang="scss" scoped>
    .guide-profile__status {
        @include flex-center-vert;
        margin-top: 0.75rem;
        border-radius: 1.75rem;
        padding: 0.5rem;
        height: 2.5rem;
        width: 6rem;
        cursor: pointer;
        background-color: $secondary;
        position: relative;
        transition: all 0.5s ease;
        user-select: none;
        span {
            position: absolute;
            display: block;
            right: 0.325rem;
            width: 1.75rem;
            height: 1.75rem;
            background-color: $white;
            border-radius: 50%;
            transition: transform 0.5s ease;
            z-index: 2;
            @media screen and (max-width: 480px) {
                width: 1.5rem;
                height: 1.5rem;
            }
        }
        p {
            position: relative;
            z-index: 1;
            color: $white;
            margin: 0;
            width: calc(100% - 2rem);
            text-align: center;
            font-size: 0.875rem;
            @media screen and (max-width: 480px) {
                font-size: 0.75rem;
                width: calc(100% - 1.5rem);
            }
        }
        &--off {
            background-color: $white;
            p {
                color: $black;
                margin-left: auto;
            }
            span {
                transform: translateX(-3.5rem);
                background-color: $black;
                @media screen and (max-width: 480px) {
                    transform: translateX(-3rem);
                }
            }
        }
        @media screen and (max-width: 480px) {
            margin-top: 0;
            margin-left: 0.75rem;
            width: 5rem;
            height: 2rem;
            padding: 0.325rem;
        }
    }
</style>