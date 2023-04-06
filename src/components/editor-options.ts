import { EditorGlobalStateOptions } from "@/lib/editor-global-state";
import {
  EditorStateOptions,
  ModelValueChangeOptions,
} from "@/lib/editor-state";

/**
 * Options that allow for editor behaviour customizations
 */
export interface IEditorOptions {
  /**
   * Only save side when there are no errors.
   * Default: ```false```
   */
  onlySaveValidSide?: boolean;

  /**
   * Configure tab size in spaces.
   * Default: ```2```
   */
  tabSize?: number;

  /**
   * Only emit errors in global mode.
   * Default: ```true```
   */
  emitOnlyGlobalErrors?: boolean;

  /**
   * Custom behaviour that allows for a short syntax in json.
   * Eg. ```=c.size+1```.
   * Default: ```true```
   */
  jsReplaceLeadingEqualWithReturn?: boolean;

  /**
   * Defines behavior when a modelValue change occurs.
   */
  modelValueChange?: {
    /**
     * Allow for external chages. If set to false nothing happens on prop change.
     * Default: ```true```
     */
    allow?: boolean;

    /**
     * Switch to global when in side mode.
     * If set to false, ensure side path existance after change.
     * Default: ```true```
     */
    switchToGlobal?: boolean;
  };
}

export class EditorOptions {
  emitOnlyGlobalErrors: boolean;
  onlySaveValidSide: boolean;
  tabSize: number;
  jsReplaceLeadingEqualWithReturn: boolean;
  modelValueChange: ModelValueChangeOptions;
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

    this.modelValueChange = {
      allow: options?.modelValueChange?.allow ?? true,
      switchToGlobal: options?.modelValueChange?.switchToGlobal ?? true,
    };
  }

  public get generalOptions(): EditorStateOptions {
    return {
      onlySaveValidSide: this.onlySaveValidSide,
      modelValueChange: this.modelValueChange,
    };
  }

  public get globalOptions(): EditorGlobalStateOptions {
    return {
      tabSize: this.tabSize,
      jsReplaceLeadingEqualWithReturn: this.jsReplaceLeadingEqualWithReturn,
    };
  }
}
