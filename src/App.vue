<template>
    <div class="layout">
        <h1 class="logo">Guides to go</h1>

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
        .logo {
            text-align: center;
            color: $white;
            font-size: 2rem;
            font-weight: bold;
            margin: 0 0 2rem 0;
            @media screen and (max-width: 480px) {
                margin-bottom: 1rem;
                font-size: 1.5rem;
            }
        }
    }
</style>