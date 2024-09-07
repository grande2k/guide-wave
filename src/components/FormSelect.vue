<template>
    <div class="form-select" :class="{ 'form-select--active': isSelectActive }">
        <div class="form-select__top" @click="isSelectActive = !isSelectActive">
            <span class="form-select__current" :class="{ 'placeholder': !currentOption }" v-text="currentOption ?? placeholder"/>
        </div>

        <ul class="form-select__options">
            <li v-for="(option, index) in options" :key="index" class="form-select__option" @click="chooseOption(index)" v-text="option"/>
        </ul>

        <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow" @click="isSelectActive = !isSelectActive">
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    const isSelectActive = ref(false);
    const currentOption = ref(null);

    const emit = defineEmits(['choose']);

    const props = defineProps({
        options: {
            type: Array,
            required: true,
            default: () => [],
        },
        placeholder: {
            type: String,
            default: 'Select from the list'
        }
    });

    const chooseOption = (index) => {
        currentOption.value = props.options[index];
        emit('choose', currentOption.value);
        isSelectActive.value = false;
    }
</script>

<style lang="scss">
    .form-select {
        display: block;
        position: relative;
        background-color: $white;
        border-radius: 0.5rem;
        transition: box-shadow 0.2s ease;
        cursor: pointer;
        user-select: none;
        color: $white;
        line-height: 1.25;
        &__arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0.5rem;
            transition: $transition;
            z-index: 2;
        }
        &__option,
        &__current {
            @include flex-center-vert;
            font-size: 1rem;
            color: $black;
            font-weight: normal;
            background-color: $white;
        }
        &__current {
            padding: 1rem 0.75rem;
            border-radius: 0.5rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.5rem;
            }
            &.placeholder {
                color: #aaa;
            }
        }
        &__option {
            padding: 1rem 0.75rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.5rem;
                font-size: 0.875rem;
            }
            &:hover {
                background-color: rgba($color: $primary, $alpha: 0.125);
            }
        }
        &__options {
            visibility: hidden;
            opacity: 0;
            margin-top: 2.25rem;
            transition: opacity 0.3s ease;
            position: absolute;
            left: 0;
            top: 0.75rem;
            width: 100%;
            height: auto;
            background-color: $white;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            z-index: 3;
            @media screen and (max-width: 480px) {
                margin-top: 2rem;
            }
        }
        &--active {
            box-shadow: 0 2px 4px 0 rgba($color: $black, $alpha: 0.25);
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            .form-select__options {
                visibility: visible;
                opacity: 1;
                box-shadow: 0 2px 4px 0 rgba($color: $black, $alpha: 0.25);
            }
            .form-select__arrow {
                transform: rotate(180deg);
            }
        }
    }
</style>