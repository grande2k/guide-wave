<template>
    <section class="login page page--bg">
        <form action="" class="login__form" @submit.prevent="submitForm">
            <h2 class="login__title form-title" v-text="$t('log_in.title')"/>

            <div class="login__form-field">
                <label for="email" class="form-label" v-text="$t('email')"/>

                <input
                    type="email"
                    class="form-input"
                    :class="{ error: v$.email.$errors.length }"
                    id="email"
                    :placeholder="$t('placeholders.email')"
                    v-model="form_data.email">
            </div>

            <div class="login__form-field">
                <label for="password" class="form-label" v-text="$t('password')"/>
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

            <button type="submit" class="form-submit">
                <img src="@/assets/images/icons/login.svg" alt="Log in">
                {{ $t('log_in.button') }}
            </button>


            <div class="form-links">
                <router-link to="/signup" class="form-link" v-text="$t('sign_up.title')"/>
                <a href="mailto:guides.to.go.2024@gmail.com" class="form-link">
                    <img src="@/assets/images/icons/mail.svg" alt="Mail">
                    {{ $t('contact_admin') }}
                </a>
            </div>
        </form>
    </section>
</template>

<script setup>
    import { ref, computed, reactive } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, email } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';
    import axios from 'axios';

    const router = useRouter();
    const { t } = useI18n();
    const toast = useToast();
    const isPasswordVisible = ref(false);

    const form_data = reactive({
        email: "",
        password: ""
    });

    const rules = computed(() => {
        return {
            email: { required, email },
            password: { required },
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const login = async () => {
        try {
            const params = {
                username: form_data.email,
                password: form_data.password
            };

            const request_headers = {headers: {'Content-Type': 'application/x-www-form-urlencoded'}};

            const response = await axios.post('https://guides-to-go.onrender.com/auth/jwt/login', params, request_headers);

            console.log(response);

            clearForm();

            router.push('/guide-profile');
            toast.success( t('messages.login_success') );
        } catch (error) {
            switch (error.response.status) {
                case 400:
                    toast.error( t('errors.login') );
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
            login();
        } else {
            toast.error( t('errors.validation') );
        }
    }

    const clearForm = () => {
        form_data.email = "";
        form_data.password = "";
    }
</script>

<style lang="scss" scoped>
    .login {
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