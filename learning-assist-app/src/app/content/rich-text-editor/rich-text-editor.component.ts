import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Start typing...';
  @Input() height = '300px';
  @Output() contentChange = new EventEmitter<string>();

  private _content = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  toolbarButtons = [
    { command: 'bold', icon: 'format_bold', title: 'Bold' },
    { command: 'italic', icon: 'format_italic', title: 'Italic' },
    { command: 'underline', icon: 'format_underlined', title: 'Underline' },
    { command: 'strikeThrough', icon: 'strikethrough_s', title: 'Strikethrough' },
    { command: 'separator' },
    { command: 'insertUnorderedList', icon: 'format_list_bulleted', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: 'format_list_numbered', title: 'Numbered List' },
    { command: 'separator' },
    { command: 'justifyLeft', icon: 'format_align_left', title: 'Align Left' },
    { command: 'justifyCenter', icon: 'format_align_center', title: 'Align Center' },
    { command: 'justifyRight', icon: 'format_align_right', title: 'Align Right' },
    { command: 'separator' },
    { command: 'createLink', icon: 'link', title: 'Insert Link' },
    { command: 'insertImage', icon: 'image', title: 'Insert Image' },
    { command: 'separator' },
    { command: 'undo', icon: 'undo', title: 'Undo' },
    { command: 'redo', icon: 'redo', title: 'Redo' }
  ];

  ngAfterViewInit() {
    this.editorRef.nativeElement.addEventListener('input', () => {
      this.updateContent();
    });

    this.editorRef.nativeElement.addEventListener('blur', () => {
      this.onTouched();
    });

    // Set initial content
    if (this._content) {
      this.editorRef.nativeElement.innerHTML = this._content;
    }
  }

  executeCommand(command: string) {
    if (command === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else if (command === 'insertImage') {
      const url = prompt('Enter image URL:');
      if (url) {
        document.execCommand('insertImage', false, url);
      }
    } else {
      document.execCommand(command, false);
    }
    
    this.updateContent();
    this.editorRef.nativeElement.focus();
  }

  private updateContent() {
    const content = this.editorRef.nativeElement.innerHTML;
    this._content = content;
    this.onChange(content);
    this.contentChange.emit(content);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._content = value || '';
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this._content;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editorRef) {
      this.editorRef.nativeElement.contentEditable = !isDisabled ? 'true' : 'false';
    }
  }

  get content(): string {
    return this._content;
  }
}
