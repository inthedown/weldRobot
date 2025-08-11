<template>
  <div>
    {{ message }}
  </div>
</template>

<script>
export default {
    name: 'About-Index',
    data() {
        return {
        message: 'This is the About Page!'
        };
    },
    mounted() {
        console.log(this.message);
    }
}
</script>

<style>

</style>