<template>
    <div class="form-select" :class="{ 'form-select--active': isSelectActive, 'error': error }" ref="target">
        <div class="form-select__top" @click="toggleSelect">
            <span class="form-select__current" :class="{ 'placeholder': !currentOption }"
                v-text="currentOption?.name ?? select_placeholder" />
        </div>

        <teleport to="body">
            <ul v-if="isSelectActive" class="form-select__options black-scroll" :style="dropdownPosition">
                <li v-for="(option, index) in filteredOptions" :key="index" class="form-select__option"
                    @click="chooseOption(option)" v-text="option?.name ?? option" />
            </ul>
        </teleport>

        <img src="@/assets/images/icons/arrow-down.svg" class="form-select__arrow" alt="arrow"
            @click="isSelectActive = !isSelectActive">
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { getServices } from '@/api';
    import { useI18n } from 'vue-i18n';

    const { t } = useI18n();
    const services = ref([]);
    const isSelectActive = ref(false);
    const currentOption = ref(null);
    const target = ref(null);
    const select_placeholder = t('select_service');
    const dropdownPosition = ref({ top: '0px', left: '0px', width: 'auto' });

    const props = defineProps({
        value: {
            type: Object,
        },
        tourist: {
            type: Boolean,
        },
        all_selected_services: {
            type: Array,
            required: true
        },
        error: {
            type: Boolean,
            default: false
        }
    });

    onMounted(async () => {
        services.value = await getServices('tourist');
        console.log(props.value);
        if (props.value && props.value.service_id) {
            const service = services.value.find(s => s.id === props.value.service_id);
            if (service) {
                currentOption.value = {
                    name: service.name,
                    id: props.value.service_id
                };
            } else {
                currentOption.value = null;
            }
        }
    });

    watch(() => props.value, (newValue) => {
        if (newValue && newValue.service_id) {
            const service = services.value.find(s => s.id === newValue.service_id);
            if (service) {
                currentOption.value = {
                    name: service.name,
                    id: newValue.service_id
                };
            } else {
                currentOption.value = null;
            }
        } else {
            currentOption.value = null;
        }
    }, { deep: true });

    watch(() => props.all_selected_services, (newSelectedServices) => {
        if (currentOption.value && !newSelectedServices.some(service => service.service_id === currentOption.value.id)) {
            currentOption.value = null;
        }
    });

    onClickOutside(target, () => isSelectActive.value = false);

    const emit = defineEmits(['choose']);

    const filteredOptions = computed(() => {
        const options = services.value.filter(service => {
            return !props.all_selected_services.some(selected => selected.service_id === service.id);
        });

        if (props.tourist) {
            return moveServiceToTop(options, 20);
        } else {
            const filtered = options.filter(option => option.id !== 20);
            return moveServiceToTop(filtered, 20);
        }
    });

    const moveServiceToTop = (options, serviceId) => {
        const serviceIndex = options.findIndex(service => service.id === serviceId);
        if (serviceIndex > -1) {
            const [service] = options.splice(serviceIndex, 1);
            options.unshift(service);
        }
        return options;
    }

    const toggleSelect = () => {
        isSelectActive.value = !isSelectActive.value;
        if (isSelectActive.value) {
            updateDropdownPosition();
        }
    }

    const updateDropdownPosition = () => {
        const rect = target.value.getBoundingClientRect();

        dropdownPosition.value = {
            top: `${rect.bottom + window.scrollY}px`,
            left: `${rect.left + window.scrollX}px`,
            width: `${rect.width}px`
        };
    }

    const chooseOption = (option) => {
        currentOption.value = option;
        emit('choose', option.id);
        isSelectActive.value = false;
    }
</script>

<style lang="scss" scoped>
    .form-select {

        &__option,
        &__current {
            text-transform: capitalize;
        }
    }
</style>