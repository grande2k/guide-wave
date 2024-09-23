<template>
    <div class="modal change-password">
        <div class="modal__content admin-modal__content" ref="target">
            <div class="modal__close" @click="emit('close')">
                <img src="@/assets/images/icons/close.svg" alt="close">
            </div>

            <form action="" class="change-password__form" @submit.prevent="submitForm">
                <div class="admin-modal__field">
                    <p v-text="$t('old_password')"/>
                    <input
                        type="text"
                        v-model="form_data.old_password"
                        :placeholder="$t('old_password')"
                        :class="{ error: v$.old_password.$errors.length }">

                    <span v-if="v$.old_password.$errors.length && v$.old_password.minLength.$invalid" class="form-error" v-text="$t('error_password_length')"/>
                </div>

                <div class="admin-modal__field">
                    <p v-text="$t('new_password')"/>
                    <input
                        type="text"
                        v-model="form_data.new_password"
                        :placeholder="$t('new_password')"
                        :class="{ error: v$.new_password.$errors.length }">

                    <span v-if="v$.new_password.$errors.length && v$.new_password.minLength.$invalid" class="form-error" v-text="$t('error_password_length')"/>
                </div>

                <submit-button blue text="save" icon="check"/>
            </form>
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, computed } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { updatePassword } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';

    const emit = defineEmits(['close']);
    const target = ref(null);

    const { t } = useI18n();
    const toast = useToast();

    const props = defineProps({
        new_password: {
            type: String
        }
    });

    const form_data = reactive({
        old_password: props.new_password || "",
        new_password: "",
    });

    const rules = computed(() => {
        return {
            old_password: { required, minLength: minLength(6) },
            new_password: { required, minLength: minLength(6) },
        }
    });

    const v$ = useVuelidate(rules, form_data);

    onClickOutside(target, () => emit('close'));

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if(result) {
            await updatePassword(form_data, t);
            emit('close');
        } else {
            toast.error(t('error_validation'));
        }
    }
</script>
