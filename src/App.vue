<template>
  <div
    v-on:keydown.ctrl.69.capture.prevent.stop="startEditingJs"
    v-on:keydown.ctrl.83.capture.prevent.stop="saveJs"
  >
    <div style="padding: 10px; border: 5px dotted red; margin: 20px">
      <ul>
        <b>TODO:</b>
        <li>Add an uneditable function signature</li>
        <li>Support multiple paths</li>
        <li>Add json schema support</li>
      </ul>
      <p>
        When cursor inside (editable) path:
        <input v-model="requiredPath" style="width: 100%" /> to edit javascritp
        press: <br />&nbsp;&nbsp;Ctrl+Shift+e or click the button<br />
        Then to save:
        <br />&nbsp;&nbsp;Ctrl+Shift+s or click the button
      </p>
    </div>

    <button v-if="editingJs" @click="saveJs">Save</button>
    <button
      v-else
      :disabled="!isInsideCustomJavascript"
      @click="startEditingJs"
    >
      Edit javascript
    </button>

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

const requiredPath = ref("address.location.customJavascript");

const isInsideCustomJavascript = computed(() => {
  return path.value?.matches(getRequiredPathArray());
});

function getRequiredPathArray() {
  return requiredPath.value.split(".").map((el) => el.trim());
}

function saveJs() {
  if (!editingJs) return;

  const jsonObject = JSON.parse(jsonContent.value);

  const requiredPathArray = getRequiredPathArray();

  let tempObject = requiredPathArray
    .slice(0, -1)
    .reduce((prev, cur) => prev[cur], jsonObject);

  tempObject[requiredPathArray[requiredPathArray.length - 1]] =
    jsContent.value.split("\n");
  jsonContent.value = JSON.stringify(jsonObject, null, 2);
  editingJs.value = false;
  content.value = jsonContent.value;
}

function startEditingJs() {
  if (!isInsideCustomJavascript) return;
  editingJs.value = true;
  content.value = getRequiredPathArray()
    .reduce((prev, cur) => prev[cur], JSON.parse(jsonContent.value))
    .map((el: string) => el)
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
  } catch {
    return;
  }
}
</script>

<style>
button {
  background-color: green;
  color: white;
}
button:disabled {
  background-color: grey;
}
</style>
