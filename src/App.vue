<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">
@import "assets/css/mixin.scss";
@import "assets/css/reset.scss";
@import "assets/fonts/font-align/iconfont.css";
body{
  width:100%;
  height:100%;
  font-size: 14px;

}
#app {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  color: #2c3e50;
  background:rgba(240,243,246,1);

}
</style>
