<template>
    <section class="forgot-password page page--bg">
        <h2 class="forgot-password__title form-title" v-text="$t('password_recovery')" />

        <form v-if="!step_1_complete" action="" class="forgot-password__form" @submit.prevent="submitStep1">
            <div class="forgot-password__form-field">
                <label for="email" class="form-label" v-text="$t('email')" />

                <input type="email" class="form-input" :class="{ error: v$.email.$errors.length }" id="email"
                    :placeholder="$t('email_placeholder')" v-model="step_1_form.email">
            </div>

            <submit-button text="continue" />
        </form>

        <form v-if="step_1_complete" action="" class="forgot-password__form" @submit.prevent="submitStep2">
            <div class="forgot-password__form-field">
                <label for="answer" class="form-label" v-text="question" />

                <input type="text" class="form-input" :class="{ error: v1$.answer.$errors.length }" id="answer"
                    :placeholder="$t('recovery_word')" v-model="step_2_form.answer">
            </div>

            <submit-button text="continue" />
        </form>

        <div class="form-links">
            <router-link to="/login" class="form-link" v-text="$t('login_title')" />
            <router-link to="/signup" class="form-link" v-text="$t('signup_title')" />

            <a :href="`mailto:${appStore.admin_email}`" class="form-link">
                <img src="@/assets/images/icons/mail.svg" alt="Mail">
                {{ $t('contact_admin') }}
            </a>
        </div>
    </section>
</template>

<script setup>
    import { ref, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, email } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';
    import { useAppStore } from '@/stores/app';
    import { sendEmailForRecovery, recoverPassword, login } from '@/api';
    import SubmitButton from '@/components/SubmitButton.vue';

    const { t } = useI18n();
    const toast = useToast();
    const router = useRouter();
    const appStore = useAppStore();
    const step_1_complete = ref(false);
    const question = ref(null);

    const step_1_form = reactive({
        email: "",
    });

    const step_2_form = reactive({
        answer: "",
    });


    const step_1_rules = computed(() => {
        return {
            email: { required, email }
        }
    });

    const step_2_rules = computed(() => {
        return {
            answer: { required }
        }
    });

    const v$ = useVuelidate(step_1_rules, step_1_form);
    const v1$ = useVuelidate(step_2_rules, step_2_form);

    const submitStep1 = async () => {
        const result = await v$.value.$validate();

        if(result) {
            const params = { email: step_1_form.email };
            question.value = await sendEmailForRecovery(params, t);
            if(question.value) {
                step_1_complete.value = true;
            }
        } else {
            toast.error(t('error_validation'));
        }
    }

    const submitStep2 = async () => {
        const result = await v1$.value.$validate();

        if (result) {
            const params = { email: step_1_form.email, answer: step_2_form.answer };
            const new_password = await recoverPassword(params, t);

            if(new_password) {
                const login_params = { email: step_1_form.email, password: new_password };
                await login(login_params, router, t);

                router.push({
                    name: 'profile',
                    query: { newPassword: new_password }
                });
            }
        } else {
            toast.error(t('error_validation'));
        }
    }
</script>