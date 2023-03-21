import ace from "brace";

ace.define(
  "ace/mode/rich_json_highlight_rules",
  [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/json_highlight_rules",
  ],
  function (acequire, exports, module) {
    var oop = acequire("ace/lib/oop");
    var JsonHighlightRules = acequire(
      "ace/mode/json_highlight_rules"
    ).JsonHighlightRules;

    var RichJsonHiglightRules = function () {
      this.$rules = new JsonHighlightRules().getRules();
    };

    oop.inherits(RichJsonHiglightRules, JsonHighlightRules);

    exports.RichJsonHiglightRules = RichJsonHiglightRules;
  }
);

ace.define(
  "ace/mode/rich_json",
  [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/json",
    "ace/mode/rich_json_highlight_rules",
    "ace/mode/matching_brace_outdent",
    "ace/mode/behaviour/cstyle",
    "ace/worker/worker_client",
  ],
  function (acequire, exports, module) {
    var oop = acequire("../lib/oop");
    var JsonMode = acequire("ace/mode/json").Mode;
    var RichJsonHighlightRules = acequire(
      "ace/mode/rich_json_highlight_rules"
    ).RichJsonHiglightRules;
    var MatchingBraceOutdent = acequire(
      "ace/mode/matching_brace_outdent"
    ).MatchingBraceOutdent;
    var CstyleBehaviour = acequire("ace/mode/behaviour/cstyle").CstyleBehaviour;

    var RichJsonMode = function () {
      this.HighlightRules = RichJsonHighlightRules;
      this.$outdent = new MatchingBraceOutdent();
      this.$behaviour = new CstyleBehaviour();
    };
    oop.inherits(RichJsonMode, JsonMode);

    (function () {
      this.$id = "ace/mode/rich_json";
    }).call(RichJsonMode.prototype);

    oop.inherits(RichJsonMode, JsonMode);

    exports.Mode = RichJsonMode;
  }
);
