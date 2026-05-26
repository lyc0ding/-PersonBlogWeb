<script setup>
    import Banner from '@/views/space/Banner.vue';
    import Main from '@/views/space/Main.vue';

</script>

<template>
    <div id="space-container">
        <Banner></Banner>
        <Main></Main>
    </div>
</template>

<style lang="scss" scoped>
#space-container{
    width: var(--blog-content-width);
    height: 100%;
    margin: 0 auto;
}
</style>
