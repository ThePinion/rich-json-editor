<template>
  <div
    v-on:keydown.ctrl.shift.69.capture.prevent.stop="
      editorState.switchToSideMode()
    "
    v-on:keydown.ctrl.shift.113.capture.prevent.stop="
      editorState.switchToGlobalMode(false)
    "
    v-on:keydown.ctrl.shift.83.capture.prevent.stop="
      editorState.switchToGlobalMode(true)
    "
  >
    <div class="editor-header">
      <button
        v-if="editorState.mode == 'global'"
        class="action-button"
        :disabled="!editorState.sideSwichable"
        @click="editorState.switchToSideMode()"
        title="Ctrl+Shift+e"
      >
        <slot name="editNode">Edit Node</slot>
      </button>
      <span v-else>
        <button
          class="action-button"
          @click="editorState.switchToGlobalMode(true)"
          title="Ctrl+Shift+s"
        >
          <slot name="save">Save</slot>
        </button>
        <button
          class="action-button"
          @click="editorState.switchToGlobalMode(false)"
          style="margin-left: 20px"
          title="Ctrl+Shift+q"
        >
          <slot name="cancel">Cancel</slot>
        </button>
      </span>
    </div>

    <Vue2AceEditor
      v-model="editorState.content"
      @cursor="cursorEmitReceiver"
      :lang="editorState.lang"
      theme="chrome"
      customStyle="width: 100%; "
      :grow="grow"
      :minLines="minLines"
      :disableTop="editorState.disableTop"
      :disableBottom="editorState.disableBottom"
      @input="handleInput"
    />
  </div>
</template>

<script lang="ts" setup>
import { EditorGlobalState } from "@/lib/editor-global-state";
import { SidePathDefinition } from "@/lib/editor-side-path";
import { EditorState } from "@/lib/editor-state";
import { ref, defineProps, defineEmits } from "vue";
import { Cursor } from "../lib/path-finder";
import Vue2AceEditor from "./AceWraper.js";

const props = defineProps<{
  value: string;
  paths: Array<SidePathDefinition>;
  grow?: boolean;
  minLines?: number;
}>();

const emit = defineEmits(["input"]);

let globalState = new EditorGlobalState(props.value, props.paths);
let editorState = ref(new EditorState(globalState));

function handleInput(value: string) {
  editorState.value.setModeContent(value);
  emit("input", editorState.value.global.content);
}

function cursorEmitReceiver(cursor: Cursor) {
  if (editorState.value.mode == "global")
    editorState.value.global.cursor = cursor;
}
</script>

<style>
.action-button {
  background-color: white;
  border: none;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  padding: 5px;
  width: 100px;
}
.action-button:hover {
  cursor: pointer;
}
.action-button:disabled {
  box-shadow: none;
}
.editor-header {
  background-color: #ebebeb;
  padding-left: 50px;
  padding-bottom: 10px;
  padding-top: 10px;
}
</style>
