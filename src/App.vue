<template>
  <div>
    <p>Rich json mode with editable fields.</p>
    <p>Is in global mode: {{ isGlobal }}</p>
    <AceJsonEditor
      v-model="jsonContent"
      :paths="paths"
      @mode="(e) => (isGlobal = e == 'global')"
      style="height: 400px"
      @annotations="logAnnotations"
      :options="{
        onlySaveValidSide: true,
        modelValueChange: {
          allow: false,
        },
      }"
    />
    <AceJsonEditor
      v-model="jsonContent"
      :paths="paths"
      @mode="(e) => (isGlobal = e == 'global')"
      style="height: 400px"
      @annotations="logAnnotations"
      :options="{
        onlySaveValidSide: true,
        modelValueChange: {
          switchToGlobal: false,
        },
      }"
    />

    <p>SqlServer mode. Growable editor.</p>
    <AceJsonEditor v-model="sqlContent" lang="sqlserver" grow />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import AceJsonEditor from "./components/AceJsonEditor.vue";
import { Annotation } from "./lib/annotation";
import { SidePathDefinition } from "./lib/editor-side-path";

function logAnnotations(a: Array<Annotation>) {
  console.log(a);
}

const isGlobal = ref(true);
const sqlContent = ref("SELECT * FROM 'Hello World!'");
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
      "a": "=0"
    }
  ],
  "any": {
    "js": "return 4;"
  }
}`);

const paths = ref<Array<SidePathDefinition>>([
  {
    paths: [
      "address.location.customJavascript",
      "customJavascript",
      "table[*].a",
      "*.js",
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
