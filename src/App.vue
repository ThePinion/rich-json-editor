<template>
  <div>
    <AceJsonEditor v-model="jsonContent" />
    {{ jsonContent }}
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import AceJsonEditor from "./components/AceJsonEditor.vue";

const jsonContent = ref(`{
  "name": "John Doe",
  "age": 30,
  "isStudent": true,
  "hobbies": [
    "reading",
    "gaming",
    "hiking"
  ],
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "customJavascript": [
        "const i =0;",
        "const a = 2;",
        "return (x) => x*i + a;"
      ]
    }
  }
}`);
</script>
