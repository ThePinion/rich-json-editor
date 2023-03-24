import { EditorGlobalStateOptions } from "@/lib/editor-global-state";
import { EditorStateOptions } from "@/lib/editor-state";

export interface IEditorOptions {
  onlySaveValidSide?: boolean;
  tabSize?: number;
}

export class EditorOptions {
  emitOnlyGlobalErrors: boolean;
  onlySaveValidSide: boolean;
  tabSize: number;
  constructor(
    options: IEditorOptions | undefined,
    emitOnlyGlobalErrors: boolean | undefined
  ) {
    this.emitOnlyGlobalErrors = emitOnlyGlobalErrors ?? false;
    this.onlySaveValidSide = options?.onlySaveValidSide ?? false;
    this.tabSize = options?.tabSize ?? 2;
  }

  public get generalOptions(): EditorStateOptions {
    return {
      onlySaveValidSide: this.onlySaveValidSide,
    };
  }

  public get globalOptions(): EditorGlobalStateOptions {
    return {
      tabSize: this.tabSize,
    };
  }
}
