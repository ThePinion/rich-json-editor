<template>
  <div id="app">
    <Vue2AceEditor
      v-model="content"
      @init="initEditor"
      lang="json"
      theme="chrome"
      width="100%"
      height="200"
    />
    {{ content }}
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Vue2AceEditor = require("./components/AceWraper.js");

function initEditor(editor: any) {
  // require("brace/mode/json");
  // require("brace/theme/chrome");
}

let content = ref("");
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
