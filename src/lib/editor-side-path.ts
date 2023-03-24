type FoldingType = "toArray" | "toString" | "auto";

export interface SidePathDefinition {
  paths: Array<string> | string;
  lang: string;
  folding?: FoldingType;
  context?: SidePathContext;
}

interface SidePathContext {
  top: Array<string>;
  bottom: Array<string>;
}

export class SidePath {
  path: Array<string>;
  lang: string;
  folding: FoldingFunction;
  context: SidePathContext;

  constructor(
    path: Array<string>,
    lang: string,
    folding: FoldingFunction,
    context: SidePathContext
  ) {
    this.path = path;
    this.lang = lang;
    this.folding = folding;
    this.context = context;
  }

  public get keyPath() {
    return this.path.map(strToKey);
  }

  public copyWithPath(path: Array<string>): SidePath {
    return new SidePath(path, this.lang, this.folding, this.context);
  }

  public getLastElementKey() {
    return this.keyPath[this.keyPath.length - 1];
  }

  public wrapContentWithContext(content: string) {
    if (this.context.top.length > 0)
      content = arrayToString(this.context.top) + "\n" + content;
    if (this.context.bottom.length > 0)
      content += "\n" + arrayToString(this.context.bottom).slice(0, -1) + "\n";
    return content;
  }

  public toString() {
    return arrayToString(this.path.map(strToChainedKey), "");
  }
}

export function toSidePathArray(
  definition: SidePathDefinition
): Array<SidePath> {
  const paths = toStringArray(definition.paths);
  return paths.map((p) =>
    newSidePath(
      p,
      definition.lang,
      definition.folding ?? "auto",
      definition.context ?? { top: [], bottom: [] }
    )
  );
}

function strToKey(str: string): string | number {
  //strings of the form: "[<digits>]"
  const match = str.match(/\[(\d+)\]/);
  if (match) return parseInt(match[1]);
  return str;
}

function strToChainedKey(str: string) {
  return typeof strToKey(str) === "number" ? str : "." + str;
}

function toStringArray(val: Array<string> | string): Array<string> {
  return Array.isArray(val) ? val : [val];
}

export function arrayToString(val: Array<string>, joiner = "\n"): string {
  if (val.length == 0) return "";
  return val
    .reduce((prev: string, cur: string) => prev + cur + joiner, "")
    .slice(0, joiner.length > 0 ? -joiner.length : undefined);
}

function newSidePath(
  path: string,
  lang: string,
  folding: FoldingType,
  context: SidePathContext
) {
  let pathArray = path
    .replaceAll("[", ".[")
    .split(".")
    .map((el) => el.trim());
  if (pathArray.length > 0 && pathArray[0] == ".")
    pathArray = pathArray.slice(1, undefined);
  return new SidePath(
    pathArray,
    lang,
    functionFromFoldingType(folding),
    context
  );
}

function functionFromFoldingType(folding: FoldingType): FoldingFunction {
  if (folding == "toArray") return foldToArray;
  if (folding == "toString") return (content) => content;
  if (folding == "auto") return foldAuto;
  else throw "Unreachable code";
}

type FoldingFunction =
  | ((content: string) => string)
  | ((content: string) => Array<string>)
  | ((content: string) => string | Array<string>);

function foldToArray(content: string): Array<string> {
  return content.split("\n");
}

function foldAuto(content: string) {
  const output = foldToArray(content);
  if (output.length == 0) return "";
  if (output.length == 1) return output[0];
  return output;
}

export function foldAutoWithReturnToEqualReplacement(content: string) {
  let output = foldAuto(content);
  if (typeof output == "string")
    output = output.replace("return ", "=").trimStart();
  return output;
}
