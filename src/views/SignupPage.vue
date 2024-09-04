<template>
    <section class="signup page page--bg">
        <form action="#" class="signup__form" @submit.prevent="submitForm">
            <h2 class="signup__title form-title" v-text="$t('sign_up.title')"/>

            <div class="signup__form-field">
                <label for="email" class="form-label" v-text="$t('email')"/>

                <input
                    type="email"
                    class="form-input"
                    :class="{ error: v$.email.$errors.length }"
                    id="email"
                    :placeholder="$t('placeholders.email')"
                    v-model="form_data.email">
            </div>

            <div class="signup__form-field">
                <label for="password" class="form-label" v-text="$t('password')" />
                <div class="form-input-wrapper">
                    <input
                        :type="isPasswordVisible ? 'text' : 'password'"
                        class="form-input"
                        :class="{ error: v$.password.$errors.length }"
                        id="password"
                        :placeholder="$t('placeholders.password')"
                        v-model="form_data.password">

                    <img v-if="!isPasswordVisible" src="@/assets/images/icons/eye-open.svg" @click="isPasswordVisible = true" alt="Show password">
                    <img v-else src="@/assets/images/icons/eye-close.svg" @click="isPasswordVisible = false" alt="Hide password">
                </div>
            </div>

            <div class="signup__form-field">
                <label for="confirm_password" class="form-label" v-text="$t('confirm_password')" />
                <div class="form-input-wrapper">
                    <input
                        :type="isRepeatPasswordVisible ? 'text' : 'password'"
                        class="form-input"
                        :class="{ error: v$.confirm_password.$errors.length }"
                        id="confirm_password"
                        :placeholder="$t('placeholders.password')"
                        v-model="form_data.confirm_password">

                    <img v-if="!isRepeatPasswordVisible" src="@/assets/images/icons/eye-open.svg" @click="isRepeatPasswordVisible = true" alt="Show password">
                    <img v-else src="@/assets/images/icons/eye-close.svg" @click="isRepeatPasswordVisible = false" alt="Hide password">
                </div>
            </div>

            <button type="submit" class="form-submit">
                <img src="@/assets/images/icons/login.svg" alt="Sign up">
                {{ $t('sign_up.button') }}
            </button>

            <div class="form-links">
                <router-link to="/login" class="form-link" v-text="$t('log_in.title')"/>
                <a href="mailto:guides.to.go.2024@gmail.com" class="form-link">
                    <img src="@/assets/images/icons/mail.svg" alt="Mail">
                    {{ $t('contact_admin') }}
                </a>
            </div>
        </form>
    </section>
</template>

<script setup>
    import { ref, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, email, sameAs } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';
    import axios from 'axios';

    const router = useRouter();
    const { t } = useI18n();
    const toast = useToast();
    const isPasswordVisible = ref(false);
    const isRepeatPasswordVisible = ref(false);

    const form_data = reactive({
        email: "",
        password: "",
        confirm_password: ""
    });

    const rules = computed(() => {
        return {
            email: { required, email },
            password: { required },
            confirm_password: { required, sameAs: sameAs(form_data.password) },
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const register = async () => {
        try {
            const params = {
                email: form_data.email,
                password: form_data.password,
                is_active: true,
                is_superuser: false,
                is_verified: false,
                username: "username",
                phone: "phone",
                role_id: 0
            };

            const response = await axios.post('https://guides-to-go.onrender.com/auth/register', params);

            console.log(response);

            clearForm();

            router.push('/login');
            toast.success( t('messages.register_success') );
        } catch (error) {
            switch (error.response.status) {
                case 400:
                    toast.error( t('errors.already_exists') );
                    break;
                case 422:
                    toast.error( t('errors.validation') );
                    break;
                default:
                    toast.error( t('errors.default') );
                    break;
            }
        }
    }

    const submitForm = async () => {
        const result = await v$.value.$validate();

        if (result) {
            register();
        } else {
            toast.error( t('errors.validation') );
        }
    }

    const clearForm = () => {
        form_data.email = "";
        form_data.password = "";
        form_data.confirm_password = "";
    }
</script>

<style lang="scss" scoped>
    .signup {
        &__form {
            &-field {
                &:not(:last-child) {
                    margin-bottom: 1rem;
                    @media screen and (max-width: 480px) {
                        margin-bottom: 0.75rem;
                    }
                }
            }
            .form-submit {
                margin-top: 2rem;
                @media screen and (max-width: 480px) {
                    margin-top: 1.25rem;
                }
            }
        }
    }
</style>