import parse, { ValueNode, Location } from "json-to-ast";
import { arrayToString } from "./editor-side-path";

export interface Cursor {
  row: number;
  column: number;
}

export class JsonPathElement {
  key: string | number;
  isArrayOrString: boolean;
  constructor(key: string | number, isArrayOrString: boolean) {
    this.key = key;
    this.isArrayOrString = isArrayOrString;
  }
  toString() {
    return typeof this.key === "number" ? "[" + this.key + "]" : this.key;
  }

  toChainedString() {
    return typeof this.key === "number"
      ? this.toString()
      : "." + this.toString();
  }

  matches(str: string) {
    if (str == "**") return true;
    if (str == "*" && typeof this.key === "string") return true;
    if (str == "[*]" && typeof this.key === "number") return true;
    return this.toString() == str;
  }
}

export class JsonPath {
  private _elements: Array<JsonPathElement>;
  public get elements(): Array<JsonPathElement> {
    return this._elements;
  }

  constructor(elements: Array<JsonPathElement>) {
    this._elements = elements;
  }

  public push(identyfier: string | number, valueNode: ValueNode) {
    this._elements.push(
      new JsonPathElement(identyfier, isArrayOrString(valueNode))
    );
  }

  public matches(required: Array<string>) {
    if (!required.length) return false;
    if (this._elements.length < required.length) return false;
    return required.every((r, index) => this._elements[index].matches(r));
  }

  public toString() {
    return arrayToString(
      this.elements.map((e) => e.toChainedString()),
      ""
    );
  }
}

export function pathAtCursorLocation(
  jsonString: string,
  cursor: Cursor
): JsonPath {
  const tokens = parse(jsonString, { loc: true });
  return getPathForLocationRecursively(
    { column: cursor.column + 1, row: cursor.row + 1 },
    new JsonPath([]),
    tokens
  );
}

function getPathForLocationRecursively(
  cursor: Cursor,
  path: JsonPath,
  node: ValueNode
): JsonPath {
  if (node.type === "Object") {
    const child = node.children.find((c) => c.loc && inBounds(cursor, c.loc));
    if (!child) return path;
    path.push(child.key.value, child.value);
    return getPathForLocationRecursively(cursor, path, child.value);
  }
  if (node.type === "Array") {
    const childIndex = node.children.findIndex(
      (c) => c.loc && inBounds(cursor, c.loc)
    );
    if (childIndex == -1) return path;
    path.push(childIndex, node.children[childIndex]);
    return getPathForLocationRecursively(
      cursor,
      path,
      node.children[childIndex]
    );
  }
  return path;
}

function isArrayOrString(node: ValueNode) {
  if (node.type == "Array") return true;
  if (node.type == "Literal") return typeof node.value == "string";
  return false;
}

function inBounds(cursor: Cursor, bounds: Location) {
  if (bounds.start.line > cursor.row) return false;
  if (bounds.end.line < cursor.row) return false;
  if (bounds.start.line == cursor.row && bounds.start.column > cursor.column)
    return false;
  if (bounds.end.line == cursor.row && bounds.end.column < cursor.column)
    return false;
  return true;
}
