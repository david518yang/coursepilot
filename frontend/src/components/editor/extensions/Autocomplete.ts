import { Extension } from '@tiptap/react';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const AUTOCOMPLETE_PLUGIN_KEY = new PluginKey('autocomplete');
const AUTOCOMPLETE_DEBOUNCE_TIME = 500;
const AUTOCOMPLETE_CONTEXT_LENGTH = 1000;

const getAutocompletedText = async (prefix: string) => {
  const autocompletedText = await fetch('/api/ai/autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefix: prefix }),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return { text: '' };
      }
    })
    .then(data => {
      return data.text;
    });
  return autocompletedText;
};

const sanitizeText = (text: string) => {
  return text.replace(/\n$/, '');
};

const Autocomplete = Extension.create({
  name: 'autocomplete',

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.storage.autocompleteSuggestion) {
          this.editor.commands.insertContentAt(this.storage.autocompletePosition, this.storage.autocompleteSuggestion);
          this.storage.autocompleteSuggestion = '';
          this.storage.autocompletePosition = null;
          return true;
        }
        return false;
      },
    };
  },

  addStorage() {
    return {
      autocompleteSuggestion: '',
      autocompletePosition: null,
      autocompleteDebouncer: null,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: AUTOCOMPLETE_PLUGIN_KEY,
        props: {
          decorations: state => {
            if (this.storage.autocompletePosition && this.storage.autocompleteSuggestion) {
              const decoration = Decoration.widget(this.storage.autocompletePosition, () => {
                const span = document.createElement('span');
                span.innerHTML = this.storage.autocompleteSuggestion;
                span.className = 'text-gray-300 transition all hover:text-gray-400 cursor-pointer';
                span.onclick = () => {
                  if (this.storage.autocompleteSuggestion) {
                    this.editor.commands.insertContentAt(
                      this.storage.autocompletePosition,
                      this.storage.autocompleteSuggestion
                    );
                    this.storage.autocompleteSuggestion = '';
                    this.storage.autocompletePosition = null;
                  }
                };
                return span;
              });
              return DecorationSet.create(state.doc, [decoration]);
            }
            return DecorationSet.empty;
          },
        },
      }),
    ];
  },

  onUpdate() {
    // Generate autocomplete suggestion when the user finishes typing
    clearTimeout(this.storage.autocompleteDebouncer);
    if (this.storage.autocompleteSuggestion) {
      this.storage.autocompleteSuggestion = '';
      this.storage.autocompletePosition = null;
      this.editor.view.dispatch(this.editor.view.state.tr);
    }
    this.storage.autocompleteDebouncer = setTimeout(async () => {
      const { state, view } = this.editor;
      const { from } = state.selection;
      const text = this.editor.getText();
      if (text) {
        const start = from - AUTOCOMPLETE_CONTEXT_LENGTH > 0 ? from - AUTOCOMPLETE_CONTEXT_LENGTH : 0;
        const prefix = text.slice(start, from);
        const completedText = await getAutocompletedText(prefix);
        if (!completedText) return;
        const sanitizedText = sanitizeText(completedText);
        this.storage.autocompleteSuggestion = sanitizedText;
        this.storage.autocompletePosition = from;
        view.dispatch(view.state.tr);
      }
    }, AUTOCOMPLETE_DEBOUNCE_TIME);
  },

  onSelectionUpdate() {
    // Clear autocomplete suggestion when the anchor is moved
    clearTimeout(this.storage.autocompleteDebouncer);
    if (this.storage.autocompleteSuggestion) {
      this.storage.autocompleteSuggestion = '';
      this.storage.autocompletePosition = null;
      this.editor.view.dispatch(this.editor.view.state.tr);
    }
  },

  onDestroy() {
    // Clear autocomplete suggestion when switching to another note
    clearTimeout(this.storage.autocompleteDebouncer);
    if (this.storage.autocompleteSuggestion) {
      this.storage.autocompleteSuggestion = '';
      this.storage.autocompletePosition = null;
      this.editor.view.dispatch(this.editor.view.state.tr);
    }
  },
});

export default Autocomplete;
