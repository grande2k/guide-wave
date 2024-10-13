<template>
    <template>
        <teleport to="body">
            <div class="background-modal modal">
                <div class="modal__content background-modal__content" ref="target">
                    <div class="modal__close" @click="emit('close')">
                        <img src="@/assets/images/icons/close.svg" alt="close">
                    </div>

                    <h2 class="background-modal__title" v-text="title"/>

                    <admin-background-upload :photo_url="photo_url" @update="updateBackground"/>
                </div>
            </div>
        </teleport>
    </template>
</template>

<script setup>
    import { ref } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { updateCountry, updateCity } from '@/api';
    import AdminBackgroundUpload from '@/components/admin/AdminBackgroundUpload.vue';

    const props = defineProps({
        initialData: {
            type: Object,
            default: {}
        },
        type: {
            type: String,
            default: ""
        },
        title: {
            type: String,
            default: ""
        },
        photo_url: {
            type: String,
            default: ""
        }
    });

    const target = ref(null);

    const emit = defineEmits(['close', 'update']);

    onClickOutside(target, () => emit('close'));

    const updateBackground = async (image) => {
        if(props.type === "countries") {
            const fd = new FormData();

            fd.append('old_country_code', props.initialData.country_code);
            fd.append('new_country_code', props.initialData.country_code);
            fd.append('country_names', JSON.stringify(props.initialData.country_names));
            if(image) {
                fd.append('file', image, image.name);
            } else {
                fd.append('file', '');
            }
            
            await updateCountry(fd);

            emit('update');
            emit('close');
        } else if(props.type === "cities") {
            const fd = new FormData();

            fd.append('old_city_names',  JSON.stringify(props.initialData.city_names));
            fd.append('new_city_names', JSON.stringify(props.initialData.city_names));

            if (image) {
                fd.append('file', image, image.name);
            } else {
                fd.append('file', '');
            }

            await updateCity(fd);

            emit('update');
            emit('close');
        }
    }
</script>

<style lang="scss" scoped>
    .background-modal {
        &__content {
            padding: 1.5rem;
        }
        &__title {
            text-align: center;
            margin: 0 0 1rem 0;
        }
    }
</style>