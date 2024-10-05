<template>
    <div class="form-row">
        <div class="form-select" :class="{ 'form-select--active': isSelectActive, error: error, disabled: disabled }" ref="target">
            <div class="form-select__top" @click="toggleSelect">
                <span class="form-select__current" :class="{ 'placeholder': !selectedCities.length }">
                    <span v-if="selectedCities.length"
                        v-text="selectedCities.map(option => option.name).join(', ')" />
                    <span v-else v-text="select_placeholder" />
                </span>
            </div>

            <ul v-if="isSelectActive" class="form-select__options black-scroll" ref="dropdown">
                <li v-for="option in filteredOptions" :key="option.lang_code" class="form-select__option"
                    :class="{ active: isSelected(option.id) }" @click="toggleCity(option.id)">
                    <span class="checkbox">
                        <img v-if="isSelected(option.id)" src="@/assets/images/icons/check.svg" alt="check">
                    </span>
                    {{ option.name }}
                </li>
            </ul>

            <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow"
                @click="isSelectActive = !isSelectActive">
        </div>
    </div>
</template>

<script setup>
    import { ref, watch, computed } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const isSelectActive = ref(false);
    const selectedCities = ref([]);
    const target = ref(null);
    const dropdown = ref(null);
    const select_placeholder = t('city');

    onClickOutside(target, (event) => {
        if (dropdown.value && dropdown.value.contains(event.target)) return;
        isSelectActive.value = false;
    });

    const emit = defineEmits(['select']);

    const props = defineProps({
        options: {
            type: Array,
            required: true,
            default: [],
        },
        allSelectedCities: {
            type: Array,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false
        },
        error: {
            type: Number,
            default: 0
        }
    });

    watch(() => props.options, (newValue) => {
        if(newValue) {
            selectedCities.value = props.options.filter(option => props.allSelectedCities.includes(option.id));
        }
    }, { immediate: true });

    const filteredOptions = computed(() => {
        return props.options.filter(option => option.id !== 131);
    });

    const toggleSelect = () => {
        isSelectActive.value = !isSelectActive.value;
    }
    const isSelected = (id) => {
        return selectedCities.value.some(option => option.id === id);
    }

    const toggleCity = (id) => {
        const index = selectedCities.value.findIndex(option => option.id === id);

        if (index === -1) {
            const selectedOption = props.options.find(option => option.id === id);
            selectedCities.value.push(selectedOption);
        } else {
            selectedCities.value.splice(index, 1);
        }

        emit('select', selectedCities.value.map(option => option.id));
    }
</script>

<style lang="scss" scoped>
    .form-select {
        &.disabled {
            opacity: 0.5;
            pointer-events: none;
        }
        &__current > span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
            @media screen and (max-width: 480px) {
                max-width: 130px;
            }
        }
        &__option {
            padding: 0.75rem;
            @media screen and (max-width: 480px) {
                padding: 0.75rem 0.5rem;
                font-size: 0.875rem;
            }
        }
    }
</style>