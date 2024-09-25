import { Extension } from "@tiptap/react";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const AUTOCOMPLETE_PLUGIN_KEY = new PluginKey("autocomplete");
const AUTOCOMPLETE_DEBOUNCE_TIME = 1000;

const Autocomplete = Extension.create({
  name: "autocomplete",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        console.log("tab");
        if (this.storage.autocompleteSuggestion) {
          this.editor.commands.insertContentAt(
            this.storage.autocompletePosition,
            this.storage.autocompleteSuggestion
          );
          this.storage.autocompleteSuggestion = "";
          this.storage.autocompletePosition = null;
          return true;
        }
        return false;
      },
    };
  },

  addStorage() {
    return {
      autocompleteSuggestion: "",
      autocompletePosition: null,
      autocompleteDebouncer: null,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: AUTOCOMPLETE_PLUGIN_KEY,
        props: {
          decorations: (state) => {
            if (
              this.storage.autocompletePosition &&
              this.storage.autocompleteSuggestion
            ) {
              const decoration = Decoration.widget(
                this.storage.autocompletePosition,
                () => {
                  const span = document.createElement("span");
                  span.textContent = this.storage.autocompleteSuggestion;
                  span.className = "text-gray-300";
                  return span;
                }
              );
              return DecorationSet.create(state.doc, [decoration]);
            }
            return DecorationSet.empty;
          },
        },
      }),
    ];
  },

  onUpdate() {
    clearTimeout(this.storage.autocompleteDebouncer);
    if (this.storage.autocompleteSuggestion) {
      this.storage.autocompleteSuggestion = "";
      this.storage.autocompletePosition = null;
      this.editor.view.dispatch(this.editor.view.state.tr);
    }
    this.storage.autocompleteDebouncer = setTimeout(() => {
      const { state, view } = this.editor;
      const { from } = state.selection;
      const text = this.editor.getText();
      if (text) {
        const completedText = "completed text"; // fetch from LLM
        if (!completedText) return;
        this.storage.autocompleteSuggestion = completedText;
        this.storage.autocompletePosition = from;
        view.dispatch(view.state.tr);
      }
    }, AUTOCOMPLETE_DEBOUNCE_TIME);
  },
});

export default Autocomplete;
