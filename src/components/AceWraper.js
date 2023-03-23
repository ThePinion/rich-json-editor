import ace from "brace";

export default {
  name: "AceWraper",
  render: function (h) {
    return h("div", {
      attrs: {
        style: this.customStyle,
      },
    });
  },
  props: {
    value: String,
    lang: String,
    theme: String,
    customStyle: String,
    grow: Boolean,
    minLines: Number,
    options: Object,
    disableTop: Number,
    disableBottom: Number,
  },
  data: function () {
    return {
      editor: null,
    };
  },
  methods: {
    setEditorTheme: async function (newTheme) {
      await import(
        /* webpackChunkName: "theme-[request]" */ "brace/theme/" + newTheme
      );
      this.editor.setTheme("ace/theme/" + newTheme);
    },
    setEditorLang: async function (newLang) {
      await requireMode(newLang);
      this.editor.getSession().setMode("ace/mode/" + newLang);
    },
    documentLength: function () {
      return this.editor.getSession().getDocument().getLength();
    },
    calculateReadOnly: function (cursorRow) {
      if (this.disableTop && cursorRow < this.disableTop) return true;
      if (
        this.disableBottom &&
        cursorRow >= this.documentLength() - this.disableBottom
      ) {
        return true;
      }

      return false;
    },
    resizeEditor: function () {
      if (!this.grow) return;
      var lineHeight = this.editor.renderer.lineHeight;
      var lines = this.documentLength();
      if (this.minLines && this.minLines > lines) lines = this.minLines;
      this.$el.style.height = lineHeight * (lines + 3) + "px";
      this.editor.resize();
    },
  },
  watch: {
    value: function (val) {
      if (this.editor.session.getValue() == val) return;
      this.editor.session.setValue(val, 1);
      this.editor.session.selection.moveCursorToPosition({
        row: this.disableTop,
        column: 0,
      });
    },
    theme: function (newTheme) {
      this.setEditorTheme(newTheme);
    },
    lang: function (newLang) {
      this.setEditorLang(newLang);
    },
    options: function (newOption) {
      this.editor.setOptions(newOption);
    },
    height: function () {
      this.$nextTick(function () {
        this.editor.resize();
      });
    },
    width: function () {
      this.$nextTick(function () {
        this.editor.resize();
      });
    },
    customStyle: function () {
      this.$el.style = this.customStyle;
      this.resizeEditor();
    },
  },
  beforeDestroy: function () {
    this.editor.destroy();
    this.editor.container.remove();
  },
  mounted: async function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias

    await import(/* webpackChunkName: "emmet" */ "brace/ext/emmet");

    this.editor = ace.edit(this.$el);
    var editor = this.editor;
    editor.$blockScrolling = Infinity;

    this.setEditorTheme(this.theme ?? "chrome");
    this.setEditorLang(this.lang ?? "text");

    editor.setOption("enableEmmet", true);
    editor.setShowPrintMargin(false);
    editor.setValue(this.value ?? "", 1);

    if (this.options) editor.setOptions(this.options);

    this.resizeEditor();

    editor.on("change", () => {
      var content = editor.getValue();
      this.$emit("input", content);
      this.resizeEditor();
    });

    editor.session.selection.on("changeCursor", () => {
      const cursor = editor.selection.getCursor();

      editor.setReadOnly(this.calculateReadOnly(cursor.row));

      this.$emit("cursor", editor.selection.getCursor());
    });

    editor.session.selection.on("changeSelection", () => {
      const range = editor.selection.getRange();

      editor.setReadOnly(
        this.calculateReadOnly(range.start.row) ||
          this.calculateReadOnly(range.end.row)
      );
    });

    editor.session.on("changeAnnotation", () => {
      this.$emit("annotations", editor.session.getAnnotations());
    });
  },
};

async function requireMode(lang) {
  if (lang == "rich_json") {
    await import(/* webpackChunkName: "mode-rich_json." */ "brace/mode/json");
    await import(
      /* webpackChunkName: "mode-rich_json." */ "/src/lib/rich-json-mode"
    );
  } else {
    await import(/* webpackChunkName: "mode-[request]" */ "brace/mode/" + lang);
  }
}
