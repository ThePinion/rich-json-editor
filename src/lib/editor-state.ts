import { EditorGlobalState } from "./editor-global-state";
import { EditorSideState } from "./editor-side-state";

const RICH_JSON = "rich_json";

export class EditorState {
  public content: string;
  public global: EditorGlobalState;
  public side: EditorSideState | null;

  constructor(globalState: EditorGlobalState) {
    this.content = globalState.content;
    this.global = globalState;
    this.side = null;
  }

  public get mode(): "global" | "side" {
    return this.side ? "side" : "global";
  }

  public get sideSwichable(): boolean {
    return !this.side && !!this.global.findMatchingPath();
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
    const matchedPath = this.global.findMatchingPath();
    if (!matchedPath) throw "EDITOR: Must be inside one of matching paths!";

    this.side = this.global.getSideState(matchedPath);
    this.content = this.side.content;
  }

  public switchToGlobalMode(save = true) {
    if (!this.side)
      throw "EDITOR: Must be in side mode to switch to global mode!";
    const sideState = this.side;
    if (save) this.global.saveSideState(sideState);
    this.content = this.global.content;
    this.side = null;
  }

  public setModeContent(value: string) {
    if (!this.side) this.global.content = value;
    else this.side.content = value;
  }

  public get lang(): string {
    return this.side?.lang ?? RICH_JSON;
  }
}
