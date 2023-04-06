import { EditorGlobalState } from "./editor-global-state";
import { SidePath } from "./editor-side-path";
import { EditorSideState } from "./editor-side-state";
import { JsonPath } from "./path-finder";

export class EditorState {
  public content: string;
  public global: EditorGlobalState;
  public side: EditorSideState | null;
  public options: EditorStateOptions;

  constructor(globalState: EditorGlobalState, options: EditorStateOptions) {
    this.content = globalState.content;
    this.global = globalState;
    this.side = null;
    this.options = options;
  }

  public get mode(): "global" | "side" {
    return this.side ? "side" : "global";
  }

  public get currentPath(): CurrentPath {
    if (this.side) return new CurrentPath(this.side.path, false);
    return this.global.findCurrentPath();

    // const matc
    // return !this.side && !!this.global.findMatchingPath();
  }

  public get disableTop(): number {
    return this.side ? this.side.disableTop : 0;
  }

  public get disableBottom(): number {
    return this.side ? this.side.disableBottom : 0;
  }

  public switchToSideMode() {
    if (this.side)
      throw "EDITOR: Must be in global mode to switch to side mode!";
    const matchedPath = this.global.findCurrentPath();
    if (!matchedPath.matched)
      throw "EDITOR: Must be inside one of matching paths!";

    this.side = this.global.getSideState(matchedPath.matched);
    this.content = this.side.content;
  }

  public switchToGlobalMode(save = true) {
    if (!this.side)
      throw "EDITOR: Must be in side mode to switch to global mode!";

    if (save) {
      if (!this.isSideSavable) throw "EDITOR: Side is currently not savable!";
      this.global.saveSideState(this.side);
    }
    this.content = this.global.content;
    this.side = null;
  }

  public forceChangeGlobalContent(newContent: string) {
    if (!this.options.modelValueChange.allow) {
      console.warn(
        "Editor model value changed but it's not allowed! Content not affected."
      );
      return;
    }
    if (newContent === this.global.content) return;
    this.global.content = newContent;
    if (this.mode == "side" && this.options.modelValueChange.switchToGlobal)
      this.switchToGlobalMode(false);
    if (this.mode == "global") this.content = newContent;
  }

  public setModeContent(value: string) {
    if (!this.side) this.global.content = value;
    else this.side.content = value;
  }

  public get isSideSavable() {
    if (!this.side) return false;
    if (!this.options.onlySaveValidSide) return true;
    return this.side.annotations.find((a) => a.type == "error") == undefined;
  }

  public get lang(): string {
    return this.side?.lang ?? this.global.lang;
  }
}

export class CurrentPath {
  private _path: SidePath | JsonPath | undefined;
  private _matched: boolean;

  constructor(path: SidePath | JsonPath | undefined, matched = true) {
    this._path = path;
    this._matched = path instanceof SidePath && matched;
  }

  public get matched() {
    return this._matched ? (this._path as SidePath) : undefined;
  }

  public toString() {
    return this._path?.toString();
  }
}

export interface EditorStateOptions {
  onlySaveValidSide: boolean;
  modelValueChange: ModelValueChangeOptions;
}

export interface ModelValueChangeOptions {
  allow: boolean;
  switchToGlobal: boolean;
}
