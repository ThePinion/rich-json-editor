<template>
  <div
    id="app"
    v-on:keydown.ctrl.69.capture.prevent.stop="startEditingJs"
    v-on:keydown.ctrl.83.capture.prevent.stop="saveJs"
  >
    <div style="width: 100%">
      <ul>
        <b>TODO:</b>
        <li>Add an uneditable function signature</li>
        <li>Make json paths easly declarative</li>
        <li>Add json schema support</li>
      </ul>
      <p>
        When cursor inside path: ".address.location.customJavascript" to edit
        javascritp press:
        <br />&nbsp;&nbsp;Ctrl+Shift+e or click the button<br />
        Then to save:
        <br />&nbsp;&nbsp;Ctrl+Shift+s or click the button
      </p>
      <button v-if="editingJs" @click="saveJs">Save</button>
      <button
        v-else
        :disabled="!isInsideCustomJavascript"
        @click="startEditingJs"
      >
        Edit javascript
      </button>
    </div>

    <Vue2AceEditor
      v-model="content"
      @cursor="cursorEmitReceiver"
      :lang="editingJs ? 'javascript' : 'rich_json'"
      theme="chrome"
      width="100%"
      height="500"
      @input="handleInput"
    />
    <!-- {{ jsonContent }}
    <br />
    {{ content }}
    <br />
    {{ path?.toString() }} -->
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import pathAtCursorLocation, { Cursor } from "./lib/path-finder";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Vue2AceEditor = require("./components/AceWraper.js");

let jsonContent = ref(`{
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

const content = ref(jsonContent.value);

const path = ref();

const editingJs = ref(false);
const jsContent = ref("");

const isInsideCustomJavascript = computed(() =>
  path.value?.toString().includes(".address.location.customJavascript")
);

function saveJs() {
  if (!editingJs) return;
  let tempObject = JSON.parse(jsonContent.value);

  tempObject.address.location.customJavascript = jsContent.value
    .replace(/"/g, '\\"')
    .split("\n");
  jsonContent.value = JSON.stringify(tempObject, null, 2);
  editingJs.value = false;
  content.value = jsonContent.value;
}

function startEditingJs() {
  if (!isInsideCustomJavascript) return;
  editingJs.value = true;
  content.value = JSON.parse(jsonContent.value)
    .address.location.customJavascript.map((el: string) => el)
    .reduce((prev: string, cur: string) => prev + cur + "\n", "")
    .slice(0, -1);
}

function handleInput(value: string) {
  if (editingJs.value) {
    jsContent.value = value;
  } else {
    jsonContent.value = value;
  }
}

function cursorEmitReceiver(cursor: Cursor) {
  try {
    path.value = pathAtCursorLocation(jsonContent.value, cursor);
  } catch (e) {
    console.log(e);
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
