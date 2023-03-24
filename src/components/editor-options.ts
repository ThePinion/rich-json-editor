import { EditorGlobalStateOptions } from "@/lib/editor-global-state";
import { EditorStateOptions } from "@/lib/editor-state";

export interface IEditorOptions {
  onlySaveValidSide?: boolean;
  tabSize?: number;
  emitOnlyGlobalErrors?: boolean;
  jsReplaceLeadingEqualWithReturn?: boolean;
}

export class EditorOptions {
  emitOnlyGlobalErrors: boolean;
  onlySaveValidSide: boolean;
  tabSize: number;
  jsReplaceLeadingEqualWithReturn: boolean;
  constructor(
    options: IEditorOptions | undefined,
    emitOnlyGlobalErrors: boolean | undefined
  ) {
    this.emitOnlyGlobalErrors =
      emitOnlyGlobalErrors ?? options?.emitOnlyGlobalErrors ?? false;
    this.onlySaveValidSide = options?.onlySaveValidSide ?? false;
    this.tabSize = options?.tabSize ?? 2;
    this.jsReplaceLeadingEqualWithReturn =
      options?.jsReplaceLeadingEqualWithReturn ?? true;
  }

  public get generalOptions(): EditorStateOptions {
    return {
      onlySaveValidSide: this.onlySaveValidSide,
    };
  }

  public get globalOptions(): EditorGlobalStateOptions {
    return {
      tabSize: this.tabSize,
      jsReplaceLeadingEqualWithReturn: this.jsReplaceLeadingEqualWithReturn,
    };
  }
}
