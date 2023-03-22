import { SidePath, arrayToString } from "./editor-side-path";

export class EditorSideState {
  content: string;
  path: SidePath;

  constructor(initialContent: string, path: SidePath) {
    this.content = path.wrapContentWithContext(initialContent);
    this.path = path;
  }

  public get lang() {
    return this.path.lang;
  }

  public get disableTop(): number {
    return this.path.context.top.length;
  }

  public get disableBottom(): number {
    return this.path.context.bottom.length;
  }

  public getFoldedContent() {
    const end = this.disableBottom;
    const stripped = this.content
      .split("\n")
      .slice(this.disableTop, end != 0 ? -end : undefined);
    const arr = arrayToString(stripped);
    return this.path.folding(arr);
  }
}
