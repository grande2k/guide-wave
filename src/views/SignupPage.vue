<template>
    <section class="signup page page--bg">
        <div class="scroll-parent white-scroll">
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
                            name="email"
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
                            name="tel"
                            maxlength="15"
                            :placeholder="$t('placeholders.tel')"
                            v-model="form_data.phone"
                            @input="form_data.phone = validatePhone($event.target.value)">

                        <span v-if="v$.phone.$errors.length && v$.phone.minLength.$invalid" class="form-error" v-text="$t('errors.phone_length')"/>
                    </div>

                    <div class="signup__form-field">
                        <label for="password" class="form-label" v-text="$t('password')"/>

                        <div class="form-input-wrapper">
                            <input
                                :type="isPasswordVisible ? 'text' : 'password'"
                                class="form-input"
                                :class="{ error: v$.password.$errors.length }"
                                id="password"
                                name="password"
                                :placeholder="$t('placeholders.password')"
                                v-model="form_data.password">

                            <img v-if="!isPasswordVisible" src="@/assets/images/icons/eye-open.svg" @click="isPasswordVisible = true" alt="Show password">
                            <img v-else src="@/assets/images/icons/eye-close.svg" @click="isPasswordVisible = false" alt="Hide password">
                        </div>

                        <span v-if="v$.password.$errors.length && v$.password.minLength.$invalid" class="form-error" v-text="$t('errors.password_length')"/>
                    </div>

                    <div class="signup__form-field">
                        <label for="confirm_password" class="form-label" v-text="$t('confirm_password')"/>

                        <div class="form-input-wrapper">
                            <input
                                :type="isRepeatPasswordVisible ? 'text' : 'password'"
                                class="form-input"
                                :class="{ error: v$.confirm_password.$errors.length }"
                                id="confirm_password"
                                name="confirm_password"
                                :placeholder="$t('placeholders.password')"
                                v-model="form_data.confirm_password">

                            <img v-if="!isRepeatPasswordVisible" src="@/assets/images/icons/eye-open.svg" @click="isRepeatPasswordVisible = true" alt="Show password">
                            <img v-else src="@/assets/images/icons/eye-close.svg" @click="isRepeatPasswordVisible = false" alt="Hide password">
                        </div>

                        <span v-if="v$.confirm_password.$errors.length && v$.confirm_password.sameAs.$invalid" class="form-error" v-text="$t('errors.password_not_same')"/>
                    </div>
                </div>

                <submit-button text="sign_up.button" icon="login" :loading="response_loading"/>
            </form>

            <div class="form-links">
                <router-link to="/login" class="form-link" v-text="$t('log_in.title')"/>
                <a :href="`mailto:${appStore.admin_email}`" class="form-link">
                    <img src="@/assets/images/icons/mail.svg" alt="Mail">
                    {{ $t('contact_admin') }}
                </a>
            </div>
        </div>
    </section>
</template>

<script setup>
    import { ref, reactive, computed } from 'vue';
    import { useVuelidate } from '@vuelidate/core';
    import { required, email, sameAs, minLength } from '@vuelidate/validators';
    import { useToast } from 'vue-toastification';
    import { useI18n } from 'vue-i18n';
    import { useRouter } from 'vue-router';
    import { useAppStore } from '@/stores/app';
    import { validatePhone } from '@/utils/validatePhone';
    import axios from 'axios';
    import SubmitButton from '@/components/SubmitButton.vue';

    const router = useRouter();
    const { t } = useI18n();
    const appStore = useAppStore();
    const toast = useToast();
    const isPasswordVisible = ref(false);
    const isRepeatPasswordVisible = ref(false);

    const response_loading = ref(false);

    const form_data = reactive({
        email: "",
        phone: "",
        password: "",
        confirm_password: ""
    });

    const rules = computed(() => {
        return {
            email: { required, email },
            phone: { required, minLength: minLength(6) },
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

            response_loading.value = true;

            const response = await axios.post('https://guides-to-go.onrender.com/auth/register', params);

            response_loading.value = false;

            console.log(response);

            clearForm();

            router.push('/login');
            toast.success( t('messages.register_success') );
        } catch (error) {
            response_loading.value = false;

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