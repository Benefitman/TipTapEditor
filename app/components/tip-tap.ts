import Component from '@glimmer/component';
import { Editor, Content } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { action, set } from '@ember/object';
import localForage from 'localforage';

interface TipTapArgs {}

export default class TipTap extends Component<TipTapArgs> {
  editor?: Editor;
  forageKey: string = 'tip-tap';
  isBoldActive: boolean = false;
  isItalicActive: boolean = false;
  isBulletListActive: boolean = false;

  @action
  async setupTipTap(element: HTMLElement) {
    const self = this;
    this.editor = new Editor({
      element,
      content: await this.loadContent(),
      extensions: [StarterKit],
      onSelectionUpdate() {
        self.updateAttributes();
      },
      async onUpdate({ editor }) {
        await localForage.setItem(self.forageKey, editor.getJSON());
      },
    });
  }

  @action
  makeBold() {
    this.editor?.chain().focus().toggleBold().run();
    this.updateAttributes();
  }

  @action
  makeItalic() {
    this.editor?.chain().focus().toggleItalic().run();
    this.updateAttributes();
  }

  @action
  makeBulletList() {
    this.editor?.chain().focus().toggleBulletList().run();
    this.updateAttributes();
  }

  @action
  undoLast() {
    this.editor?.chain().focus().undo().run();
    this.updateAttributes();
  }

  @action
  redoLast() {
    this.editor?.chain().focus().redo().run();
    this.updateAttributes();
  }

  @action
  download() {
    const html = this.getHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.setAttribute('download', 'tip-tap.html');
    a.setAttribute('href', window.URL.createObjectURL(blob));
    a.click();
  }

  @action
  removeFormating() {
    this.editor?.chain().selectAll().clearNodes().unsetAllMarks().run();
  }

  @action
  deleteText() {
    this.editor?.chain().focus().clearContent().run();
  }

  @action
  print() {
    const html = this.getHTML();
    const printWindow = window.open();

    if (printWindow === null) {
      alert('Could not print');
      return;
    }

    printWindow.document.open('text/html');
    printWindow.document.write(html);
    printWindow.focus();
    printWindow.print();
    printWindow.document.close(); //funktioniert nicht :*(
  }

  updateAttributes() {
    set(this, 'isBoldActive', this.isActive('bold'));
    set(this, 'isItalicActive', this.isActive('italic'));
    set(this, 'isBulletListActive', this.isActive('bulletList'));
  }

  isActive(name: string): boolean {
    return this.editor?.isActive(name) ?? false;
  }

  async loadContent(): Promise<Content> {
    return ((await localForage.getItem(this.forageKey)) as Content) ?? '';
  }

  getHTML(): string {
    return this.editor?.getHTML() ?? '';
  }
}
