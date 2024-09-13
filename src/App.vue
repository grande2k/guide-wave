<template>
    <div class="layout">
        <router-link to="/" class="go-home" v-text="$t('go_home')"/>

        <h1 class="logo">
            Guides to go
            <br v-if="$cookies.get('user_role') === '2'">
            <span v-if="$cookies.get('user_role') === '2'" v-text="$t('admin')"/>
        </h1>

        <router-view/>
    </div>
</template>

<script setup>
    
</script>

<style lang="scss" scoped>
    .layout {
        @include flex-center-column;
        height: 100%;
        position: relative;
        z-index: 2;
        padding: 0 1rem;
        .go-home {
            position: absolute;
            top: 2rem;
            left: 2rem;
            background-color: $white;
            padding: 1rem;
            text-decoration: none;
            border-radius: 0.5rem;
            color: $black;
            @media screen and (max-width: 480px) {
                top: 1rem;
                left: 1rem;
                font-size: 0.75rem;
                padding: 0.75rem;
            }
        }
        .logo {
            text-align: center;
            color: $white;
            font-size: 2rem;
            font-weight: bold;
            margin: 0 0 2rem 0;
            line-height: 1;
            span {
                font-weight: normal;
                font-size: 1.25rem;
            }
            @media screen and (max-width: 480px) {
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
        }
    }
</style>