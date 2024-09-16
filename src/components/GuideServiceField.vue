<template>
    <div class="guide-profile__service delete">
        <services-select
            :value="local_service"
            :error="error"
            :all_selected_services="all_selected_services"
            @choose="handleServiceSelect" />

        <input type="text" class="form-input service-price" :class="{ error: error }" :placeholder="$t('price')"
            maxlength="5" v-model="local_service.price" @input="handlePriceInput" />

        <button type="button" class="delete-btn" @click="emit('delete')">
            <img src="@/assets/images/icons/delete.svg" alt="delete">
        </button>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { validatePrice } from '@/utils/validatePrice';
    import ServicesSelect from './ServicesSelect.vue';

    const emit = defineEmits(['update', 'delete']);

    const props = defineProps({
        value: {
            type: Object,
            default: { service_id: null, price: null },
        },
        error: Boolean,
        all_selected_services: Array,
    });

    const local_service = ref({ ...props.value });

    watch(() => props.value, (newValue) => {
        local_service.value = { ...newValue };
    }, { deep: true });

    const handleServiceSelect = (service_id) => {
        local_service.value.service_id = service_id;
        emit('update', { ...local_service.value });
    };

    const handlePriceInput = () => {
        local_service.value.price = +validatePrice(local_service.value.price);
        emit('update', { ...local_service.value });
    };
</script>


<style lang="scss" scoped>
    .guide-profile__service {
        display: flex;
        margin-bottom: 0.5rem;
        &.delete {
            .delete-btn {
                @include flex-center;
                background-color: $white;
                border-radius: 0.5rem;
                padding: 0.5rem;
                cursor: pointer;
                margin-left: 0.5rem;
                width: 3.5rem;
                img {
                    width: 1.5rem;
                    filter: invert(1);
                }
            }
            input.service-price {
                width: 17.5%;
            }
            & > *:first-child {
                width: 67.5%;
            }
        }
        & > *:first-child {
            flex: auto;
            margin-right: 0.5rem;
            text-transform: capitalize;
            height: 3.5rem;
            margin-bottom: 0 !important;
        }
        input.service-price {
            width: 17.5%;
            height: 3.5rem;
        }
    }
</style>