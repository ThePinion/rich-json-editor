var ace = require("brace");

module.exports = {
  render: function (h) {
    var height = this.height ? this.px(this.height) : "100%";
    var width = this.width ? this.px(this.width) : "100%";
    return h("div", {
      attrs: {
        style: "height: " + height + "; width: " + width,
      },
    });
  },
  props: {
    value: String,
    lang: true,
    theme: String,
    height: true,
    width: true,
    options: Object,
  },
  data: function () {
    return {
      editor: null,
      contentBackup: "",
    };
  },
  methods: {
    px: function (n) {
      if (/^\d*$/.test(n)) {
        return n + "px";
      }
      return n;
    },
  },
  watch: {
    value: function (val) {
      if (this.contentBackup !== val) {
        this.editor.session.setValue(val, 1);
        this.contentBackup = val;
      }
    },
    theme: function (newTheme) {
      this.editor.setTheme("ace/theme/" + newTheme);
    },
    lang: function (newLang) {
      requireMode(newLang);
      this.editor.getSession().setMode("ace/mode/" + newLang);
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
  },
  beforeDestroy: function () {
    this.editor.destroy();
    this.editor.container.remove();
  },
  mounted: function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var vm = this;
    var lang = this.lang || "text";
    var theme = this.theme || "chrome";

    require("brace/ext/emmet");

    var editor = (vm.editor = ace.edit(this.$el));
    editor.$blockScrolling = Infinity;

    this.$emit("init", editor);

    editor.setOption("enableEmmet", true);

    require("brace/theme/" + theme);

    requireMode(lang);
    editor.getSession().setMode("ace/mode/" + lang);

    editor.setTheme("ace/theme/" + theme);
    if (this.value) editor.setValue(this.value, 1);
    this.contentBackup = this.value;

    editor.on("change", function () {
      var content = editor.getValue();
      vm.$emit("input", content);
      vm.contentBackup = content;
    });
    editor.session.selection.on("changeCursor", () => {
      this.$emit("cursor", editor.selection.getCursor());
    });
    editor.commands.addCommand({
      name: "insertButton",
      exec: function (editor) {
        var buttonHtml = '<button type="button">Click Me!</button>';
        editor.insert(buttonHtml);
      },
      bindKey: { win: "Ctrl-B", mac: "Command-B" }, // optional keybinding
    });
    if (vm.options) editor.setOptions(vm.options);
  },
};

function requireMode(lang) {
  if (lang == "rich_json") {
    require("brace/mode/json");
    require("/src/lib/rich-json-mode");
  } else {
    require("brace/mode/" + lang);
  }
}
