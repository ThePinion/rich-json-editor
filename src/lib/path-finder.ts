import parse, { ValueNode, Location } from "json-to-ast";
import { arrayToString } from "./editor-side-path";

export interface Cursor {
  row: number;
  column: number;
}

export class JsonPathElement {
  value: string | number;
  constructor(value: string | number) {
    this.value = value;
  }
  toString() {
    return typeof this.value === "number" ? "[" + this.value + "]" : this.value;
  }

  toChainedString() {
    return typeof this.value === "number"
      ? this.toString()
      : "." + this.toString();
  }

  matches(str: string) {
    if (str == "[*]" && typeof this.value === "number") return true;
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

  public push(element: string | number) {
    this._elements.push(new JsonPathElement(element));
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
    path.push(child.key.value);
    return getPathForLocationRecursively(cursor, path, child.value);
  }
  if (node.type === "Array") {
    const childIndex = node.children.findIndex(
      (c) => c.loc && inBounds(cursor, c.loc)
    );
    if (childIndex == -1) return path;
    path.push(childIndex);
    return getPathForLocationRecursively(
      cursor,
      path,
      node.children[childIndex]
    );
  }
  return path;
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
