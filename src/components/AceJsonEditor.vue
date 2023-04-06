<template>
  <div
    v-on:keydown.ctrl.shift.69.capture.prevent.stop="switchToSide()"
    v-on:keydown.ctrl.shift.113.capture.prevent.stop="switchToGlobal(false)"
    v-on:keydown.ctrl.shift.83.capture.prevent.stop="switchToGlobal(true)"
  >
    <div v-if="isRich" class="editor-header">
      <button
        v-if="editorState.mode == 'global'"
        class="action-button"
        :disabled="!editorState.currentPath.matched"
        @click="switchToSide()"
        title="Ctrl+Shift+e"
      >
        <slot name="editNode">Edit Node</slot>
      </button>
      <span v-else>
        <button
          class="action-button"
          @click="switchToGlobal(true)"
          title="Ctrl+Shift+s"
          :disabled="!editorState.isSideSavable"
        >
          <slot name="save">Save</slot>
        </button>
        <button
          class="action-button"
          @click="switchToGlobal(false)"
          style="margin-left: 20px"
          title="Ctrl+Shift+q"
        >
          <slot name="cancel">Cancel</slot>
        </button>
      </span>
      <span class="path-displayer">
        {{ editorState.currentPath.toString() }}
      </span>
    </div>

    <Vue2AceEditor
      v-model="editorState.content"
      :lang="editorState.lang"
      theme="chrome"
      :customStyle="editorStyle"
      :grow="grow"
      :minLines="minLines"
      :disableTop="editorState.disableTop"
      :disableBottom="editorState.disableBottom"
      :options="{ tabSize: options.tabSize, useSoftTabs: true }"
      @input="inputReceiver"
      @cursor="cursorReceiver"
      @annotations="annotationsReceiver"
    />
  </div>
</template>

<script lang="ts" setup>
import { Annotation } from "@/lib/annotation";
import { EditorGlobalState, RICH_JSON } from "@/lib/editor-global-state";
import { SidePathDefinition } from "@/lib/editor-side-path";
import { EditorState } from "@/lib/editor-state";
import { ref, defineProps, defineEmits, computed, watch } from "vue";
import { Cursor } from "../lib/path-finder";
import Vue2AceEditor from "./AceWraper.js";
import { EditorOptions, IEditorOptions } from "./editor-options";

const props = defineProps<{
  value: string;
  paths?: Array<SidePathDefinition>;
  lang?: string;
  grow?: boolean;
  minLines?: number;
  emitOnlyGlobalErrors?: boolean;
  options?: IEditorOptions;
}>();

const options = new EditorOptions(props.options, props.emitOnlyGlobalErrors);
console.log(options);
const emit = defineEmits<{
  (e: "input", value: string): void;
  (e: "mode", value: "global" | "side"): void;
  (e: "annotations", value: Array<Annotation>): void;
}>();

let globalState = createGlobalState();
let editorState = ref(new EditorState(globalState, options.generalOptions));

watch(
  () => props.value,
  (newValue) => {
    editorState.value.forceChangeGlobalContent(newValue);
  }
);

function createGlobalState() {
  return new EditorGlobalState(
    props.value,
    props.paths,
    props.lang,
    options.globalOptions
  );
}

function inputReceiver(value: string) {
  editorState.value.setModeContent(value);
  emit("input", editorState.value.global.content);
}

function cursorReceiver(cursor: Cursor) {
  if (editorState.value.mode == "global")
    editorState.value.global.cursor = cursor;
}

function annotationsReceiver(annotations: Array<Annotation>) {
  if (editorState.value.side) editorState.value.side.annotations = annotations;
  if (options.emitOnlyGlobalErrors) {
    if (editorState.value.mode == "side") return;
    annotations = annotations.filter((a) => a.type == "error");
  }
  emit("annotations", annotations);
}

function switchToSide() {
  if (!editorState.value.currentPath.matched) return;
  editorState.value.switchToSideMode();
  emit("mode", editorState.value.mode);
}

function switchToGlobal(save = true) {
  if (editorState.value.mode == "global") return;
  if (save && !editorState.value.isSideSavable) return;
  editorState.value.switchToGlobalMode(save);
  emit("mode", editorState.value.mode);
}

const isRich = computed(() => editorState.value.global.lang == RICH_JSON);
const editorStyle = computed(
  () => `height: calc(100%${isRich.value ? " - 50px " : ""}); width: 100%`
);
</script>

<style>
.action-button {
  background-color: white;
  border: none;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  width: 100px;
  height: 25px;
  line-height: 23px;
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
  padding-right: 50px;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  align-items: center;
  height: 45px;
  box-sizing: border-box;
  padding-top: 10px;
}
.path-displayer {
  font-size: 14px;
  color: #868686;
  float: right;
  line-height: 23px;
}
</style>
