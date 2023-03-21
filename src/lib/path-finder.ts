import parse, { ValueNode, Location } from "json-to-ast";

export interface Cursor {
  row: number;
  column: number;
}
export interface JsonPathElement {
  value: string | number;
}

class JsonPath {
  private _elements: Array<JsonPathElement>;
  public get elements(): Array<JsonPathElement> {
    return this._elements;
  }

  constructor(elements: Array<JsonPathElement>) {
    this._elements = elements;
  }

  public push(key: string | number) {
    this._elements.push({ value: key });
  }

  public toString() {
    return this.elements
      .map((el) => el.value)
      .map((el) => (typeof el === "number" ? "[" + el + "]" : "." + el))
      .reduce((prev, cur) => prev + cur, "");
  }

  public matches(required: Array<string>) {
    if (this._elements.length < required.length) return false;
    return required.every((el, index) => this._elements[index].value == el);
  }
}

export default function pathAtCursorLocation(
  jsonString: string,
  cursor: Cursor
): JsonPath {
  const tokens = parse(jsonString, { loc: true });
  return getPathForLocationRecursevly(
    { column: cursor.column + 1, row: cursor.row + 1 },
    new JsonPath([]),
    tokens
  );
}

function getPathForLocationRecursevly(
  cursor: Cursor,
  path: JsonPath,
  node: ValueNode
): JsonPath {
  if (node.type === "Object") {
    const child = node.children.find((c) => c.loc && inBounds(cursor, c.loc));
    if (!child) return path;
    path.push(child.key.value);
    return getPathForLocationRecursevly(cursor, path, child.value);
  }
  if (node.type === "Array") {
    const childIndex = node.children.findIndex(
      (c) => c.loc && inBounds(cursor, c.loc)
    );
    if (childIndex == -1) return path;
    path.push(childIndex);
    return getPathForLocationRecursevly(
      cursor,
      path,
      node.children[childIndex]
    );
  }
  return path;
}

function inBounds(cursor: Cursor, bounds: Location) {
  if (
    !(
      bounds.start.line < cursor.row ||
      (bounds.start.line === cursor.row && bounds.start.column <= cursor.column)
    )
  )
    return false;
  if (
    !(
      bounds.end.line > cursor.row ||
      (bounds.end.line === cursor.row && bounds.end.column >= cursor.column)
    )
  )
    return false;
  return true;
}
