<template>
    <section class="login page page--bg">
        <h2 class="login__title form-title" v-text="$t('log_in.title')"/>

        <form action="" class="login__form" @submit.prevent="submitForm">
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

                <span v-if="v$.password.$errors.length && v$.password.minLength.$invalid" class="form-error" v-text="$t('errors.password_length')"/>
            </div>

            <submit-button text="log_in.button" icon="login" :loading="response_loading"/>
        </form>

        <div class="form-links">
            <router-link to="/signup" class="form-link" v-text="$t('sign_up.title')"/>
            <a href="mailto:guides.to.go.2024@gmail.com" class="form-link">
                <img src="@/assets/images/icons/mail.svg" alt="Mail">
                {{ $t('contact_admin') }}
            </a>
        </div>
    </section>
</template>

<script setup>
    import { ref, computed, reactive, inject, onMounted } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, email, minLength } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';
    import axios from 'axios';
    import SubmitButton from '@/components/SubmitButton.vue';

    const $cookies = inject('$cookies');
    const router = useRouter();
    const { t } = useI18n();
    const toast = useToast();
    const isPasswordVisible = ref(false);

    const response_loading = ref(false);

    onMounted(() => {
        if ( $cookies.get("access_token") ) {
            router.push('/profile');
        }
    });

    const form_data = reactive({
        email: "",
        password: ""
    });

    const rules = computed(() => {
        return {
            email: { required, email },
            password: { required, minLength: minLength(6) },
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const login = async () => {
        try {
            const params = {
                email: form_data.email,
                password: form_data.password
            };

            response_loading.value = true;

            const response = await axios.post('https://guides-to-go.onrender.com/auth/login', params);

            response_loading.value = false;

            console.log(response.data);
            $cookies.set("access_token", response.data.access_token, "1m");
            $cookies.set("user_role", response.data.user_info[0].role_id, "1m");
            router.push('/profile');
            toast.success( t('messages.login_success') );
            clearForm();
        } catch (error) {
            response_loading.value = false;

            switch (error.response.status) {
                case 401:
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
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 650px;
        @media screen and (max-width: 480px) {
            min-height: unset;
            display: block;
        }
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