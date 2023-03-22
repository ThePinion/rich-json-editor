import {
  arrayToString,
  SidePath,
  SidePathDefinition,
  toSidePathArray,
} from "./editor-side-path";
import { EditorSideState } from "./editor-side-state";
import { Cursor, JsonPath, pathAtCursorLocation } from "./path-finder";

export class EditorGlobalState {
  content: string;
  cursor: Cursor;
  sidePaths: Array<SidePath>;
  constructor(initialContent: string, sidePaths: Array<SidePathDefinition>) {
    this.content = initialContent;
    this.content = JSON.stringify(this.getContentObject(), null, 4);
    this.cursor = { row: 0, column: 0 } as Cursor;
    this.sidePaths = sidePaths.flatMap((d) => toSidePathArray(d));
  }

  public findMatchingPath(): SidePath | undefined {
    let currentPath: JsonPath;
    try {
      currentPath = pathAtCursorLocation(this.content, this.cursor);
    } catch {
      return undefined;
    }

    const found = this.sidePaths.find((sp) => currentPath.matches(sp.path));
    if (!found) return undefined;
    return found.copyWithPath(
      currentPath.elements
        .slice(0, found.path.length)
        .map((el) => el.toString())
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getContentObject(): any {
    return JSON.parse(this.content);
  }

  private getSideContent(sidePath: SidePath): string {
    const value = sidePath.keyPath.reduce((prev, cur) => {
      return prev[cur];
    }, this.getContentObject());
    if (!Array.isArray(value)) return value;
    return arrayToString(value);
  }

  public getSideState(sidePath: SidePath): EditorSideState {
    return new EditorSideState(this.getSideContent(sidePath), sidePath);
  }

  public saveSideState(sideState: EditorSideState) {
    const contentObject = this.getContentObject();
    const tempObject = sideState.path.keyPath
      .slice(0, -1)
      .reduce((prev, cur) => prev[cur], contentObject);
    tempObject[sideState.path.getLastElementKey()] =
      sideState.getFoldedContent();
    this.content = JSON.stringify(contentObject, null, 4);
  }
}
