import {
  arrayToString,
  foldAutoWithReturnToEqualReplacement,
  SidePath,
  SidePathDefinition,
  toSidePathArray,
} from "./editor-side-path";
import { EditorSideState } from "./editor-side-state";
import { CurrentPath } from "./editor-state";
import { Cursor, JsonPath, pathAtCursorLocation } from "./path-finder";

export const RICH_JSON = "rich_json";

export class EditorGlobalState {
  content: string;
  cursor: Cursor;
  sidePaths: Array<SidePath>;
  lang: string;
  options: EditorGlobalStateOptions;
  constructor(
    initialContent: string,
    sidePaths: Array<SidePathDefinition> | undefined,
    lang: string | undefined,
    options: EditorGlobalStateOptions
  ) {
    this.content = initialContent;
    this.cursor = { row: 0, column: 0 } as Cursor;
    this.sidePaths = sidePaths?.flatMap((d) => toSidePathArray(d)) ?? [];
    this.options = options;
    this.lang = lang ?? RICH_JSON;
    if (this.lang == RICH_JSON)
      try {
        this.content = JSON.stringify(
          this.getContentObject(),
          null,
          options.tabSize
        );
      } catch {
        //
      }
  }

  public findCurrentPath(): CurrentPath {
    if (this.lang != RICH_JSON) return new CurrentPath(undefined);
    let currentPath: JsonPath;
    try {
      currentPath = pathAtCursorLocation(this.content, this.cursor);
    } catch {
      return new CurrentPath(undefined);
    }
    if (
      currentPath.elements.length == 0 ||
      !currentPath.elements[currentPath.elements.length - 1].isArrayOrString
    )
      return new CurrentPath(currentPath);

    const found = this.sidePaths.find((sp) => currentPath.matches(sp.path));
    if (!found) return new CurrentPath(currentPath);

    return new CurrentPath(
      found.copyWithPath(
        currentPath.elements
          .slice(0, found.path.length)
          .map((el) => el.toString())
      )
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
    const content = this.getSideContent(sidePath);
    if (this.shouldReplaceEqualWithReturn(content, sidePath))
      return this.getSideStateEqualReplacement(content, sidePath);
    return new EditorSideState(content, sidePath);
  }

  private getSideStateEqualReplacement(
    content: string,
    sidePath: SidePath
  ): EditorSideState {
    content = content.trimStart().replace("=", "  return ");
    sidePath.folding = foldAutoWithReturnToEqualReplacement;
    return new EditorSideState(content, sidePath);
  }

  private shouldReplaceEqualWithReturn(content: string, sidePath: SidePath) {
    const trimmed = content.trimStart();
    return (
      this.options.jsReplaceLeadingEqualWithReturn &&
      sidePath.lang == "javascript" &&
      trimmed.length > 0 &&
      trimmed[0] == "=" &&
      trimmed.indexOf("\n") == -1
    );
  }

  public saveSideState(sideState: EditorSideState) {
    const contentObject = this.getContentObject();
    const tempObject = sideState.path.keyPath
      .slice(0, -1)
      .reduce((prev, cur) => prev[cur], contentObject);
    tempObject[sideState.path.getLastElementKey()] =
      sideState.getFoldedContent();
    this.content = JSON.stringify(contentObject, null, this.options.tabSize);
  }
}

export interface EditorGlobalStateOptions {
  tabSize: number;
  jsReplaceLeadingEqualWithReturn: boolean;
}
