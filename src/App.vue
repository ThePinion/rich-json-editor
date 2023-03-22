<template>
  <div>
    <AceJsonEditor v-model="jsonContent" :paths="paths" grow>
      <template v-slot:editNode> Edytuj </template>
      <template v-slot:save> Zapisz </template>
      <template v-slot:cancel> Anuluj </template>
    </AceJsonEditor>
    {{ jsonContent }}
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import AceJsonEditor from "./components/AceJsonEditor.vue";
import { SidePathDefinition } from "./lib/editor-side-path";

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
        "   const i = 0;",
        "   const a = 2;",
        "   return (x) => x*i + a;"
      ]
    }
  },
  "customJavascript": [
    "   const i = 0;",
    "   const a = 2;",
    "   return (x) => x*i + a;"
  ],
  "table": [
    {
      "a": "return 0"
    },
    {
      "a": "return 0"
    },
    {
      "a": ["   if (c === 0) return 0;", "    return 1"]
    },
    {
      "a": "return 0"
    }
  ]
}`);

const paths = ref<Array<SidePathDefinition>>([
  {
    paths: [
      "address.location.customJavascript",
      "customJavascript",
      "table[*].a",
    ],
    lang: "javascript",
    folding: "auto",
    context: {
      top: [
        "",
        "/* ",
        " * Custom transition function",
        " * c is context",
        " */",
        "function transform(c){",
      ],
      bottom: [
        "}",
        "",
        "//Predefined lines (ex. comments and function context) are uneditable",
        "",
      ],
    },
  },
]);
</script>
