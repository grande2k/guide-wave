<template>
    <button type="submit" class="form-submit" :class="{'form-submit--loading': loading, 'form-submit--blue': blue}">
        <img v-if="!loading" :src="images[icon]" :alt="icon">
        <div v-else class="preloader"><span></span></div>
        {{ $t(text) }}
    </button>
</template>

<script setup>
    import { filename } from 'pathe/utils';

    defineProps({
        text: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
        },
        loading: {
            type: Boolean,
            default: false
        },
        blue: {
            type: Boolean,
            default: false
        }
    });

    const glob = import.meta.glob('@/assets/images/icons/*.svg', { eager: true });

    const images = Object.fromEntries(
        Object.entries(glob).map(([key, value]) => [filename(key), value.default])
    )
</script>

<style lang="scss" scoped>
    .form-submit {
        position: relative;
        height: 3.5rem;
        &--blue {
            background-color: $primary;
        }
        .preloader {
            margin-right: 0.5rem;
            span {
                width: 1.5rem;
                height: 1.5rem;
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
        &--loading::after {
            opacity: 1;
        }
    }
</style>