<template>
    <form class="admin-email" @submit.prevent="submitEmail">
        <input
            type="email"
            class="form-input"
            :class="{ error: v$.$errors.length }"
            id="email"
            name="email"
            placeholder="Почта администратора"
            v-model="admin_email">

        <submit-button v-if="shouldShowEmailSaveButton" text="save" icon="check"/>
    </form>
</template>

<script setup>
    import { ref, watch, computed } from 'vue';
    import { useAppStore } from '@/stores/app';
    import { useVuelidate } from '@vuelidate/core';
    import { useToast } from 'vue-toastification';
    import { required, email } from '@vuelidate/validators';
    import { getAdminMail, updateEmail } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';

    const appStore = useAppStore();
    const toast = useToast();
    const admin_email = ref('');
    const email_state = ref({ email: admin_email.value });

    watch(() => appStore.admin_email, (newValue) => {
        if (newValue) {
            admin_email.value = newValue;
            email_state.value.email = newValue;
        }
    }, { immediate: true });

    const rules = computed(() => {
        return {
            email: { required, email },
        }
    });

    const v$ = useVuelidate(rules, email_state);

    const shouldShowEmailSaveButton = computed(() => {
        return admin_email.value && appStore.admin_email && admin_email.value !== appStore.admin_email;
    });

    const submitEmail = async () => {
        const result = await v$.value.$validate();

        if (result) {
            const params = { email: admin_email.value };
            try {
                await updateEmail(params);
                toast.success('Почта была успешно обновлена');
                appStore.setAdminEmail(await getAdminMail());
            } catch (error) {
                toast.error('Произошла ошибка');
            }
        } else {
            toast.error('Убедитесь что почта введена правильно');
        }
    }
</script>

<style lang="scss" scoped>
    .admin-email {
        margin: 2rem 0;
    }
</style>