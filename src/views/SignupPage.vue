<template>
    <section class="signup page page--bg">
        <h2 class="signup__title form-title" v-text="$t('sign_up.title')"/>

        <form action="#" class="signup__form" @submit.prevent="submitForm">
            <div class="signup__form-grid">
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
                    <label for="tel" class="form-label" v-text="$t('tel')"/>

                    <input
                        type="tel"
                        class="form-input"
                        :class="{ error: v$.phone.$errors.length }"
                        id="tel"
                        :placeholder="$t('placeholders.tel')"
                        v-model="form_data.phone">

                    <span v-if="v$.phone.minLength.$invalid && !v$.phone.integer.$invalid" class="form-error" v-text="$t('errors.phone_length')"/>
                    <span v-if="v$.phone.integer.$invalid" class="form-error" v-text="$t('errors.phone_integer')"/>
                </div>

                <div class="signup__form-field">
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

                    <span v-if="v$.password.minLength.$invalid" class="form-error" v-text="$t('errors.password_length')"/>
                </div>

                <div class="signup__form-field">
                    <label for="confirm_password" class="form-label" v-text="$t('confirm_password')"/>

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

                    <span v-if="v$.confirm_password.sameAs.$invalid" class="form-error" v-text="$t('errors.password_not_same')"/>
                </div>
            </div>

            <button type="submit" class="form-submit">
                <img src="@/assets/images/icons/login.svg" alt="Sign up">
                {{ $t('sign_up.button') }}
            </button>
        </form>

        <div class="form-links">
            <router-link to="/login" class="form-link" v-text="$t('log_in.title')"/>
            <a href="mailto:guides.to.go.2024@gmail.com" class="form-link">
                <img src="@/assets/images/icons/mail.svg" alt="Mail">
                {{ $t('contact_admin') }}
            </a>
        </div>
    </section>
</template>

<script setup>
    import { ref, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, email, sameAs, minLength, integer } from '@vuelidate/validators';
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
        phone: "",
        password: "",
        confirm_password: ""
    });

    const rules = computed(() => {
        return {
            email: { required, email },
            phone: { required, integer, minLength: minLength(6) },
            password: { required, minLength: minLength(6) },
            confirm_password: { required, sameAs: sameAs(form_data.password) },
        }
    });

    const v$ = useVuelidate(rules, form_data);

    const register = async () => {
        try {
            const params = {
                email: form_data.email,
                phone: form_data.phone,
                password: form_data.password,
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
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 650px;
        @media screen and (max-width: 480px) {
            min-height: unset;
            display: block;
        }
        &__form {
            &-grid {
                @include grid(2, 2rem 0.75rem);
                @media screen and (max-width: 480px) {
                    grid-template-columns: 1fr;
                    grid-gap: 0.75rem;
                }
            }
            .form-label {
                text-align: left;
                justify-content: flex-start;
                font-size: 1.125rem;
                @media screen and (max-width: 480px) {
                    text-align: center;
                    justify-content: center;
                }
            }
            .form-submit {
                margin-top: 2rem;
                @media screen and (max-width: 480px) {
                    margin-top: 1rem;
                }
            }
        }

        .form-links {
            @media screen and (max-width: 480px) {
                margin-top: 1rem;
            }
        }
    }
</style>