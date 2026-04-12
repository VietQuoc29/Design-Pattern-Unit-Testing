export interface Command { execute(): void; undo(): void; }

// Receiver
export class TextDocument {
  private content = '';
  getContent(): string          { return this.content; }
  setContent(c: string): void   { this.content = c; }
  append(text: string): void    { this.content += text; }
}

// Concrete Command 1 – type text
export class TypeCommand implements Command {
  private previousContent = '';
  constructor(private doc: TextDocument, private text: string) {}
  execute(): void { this.previousContent = this.doc.getContent(); this.doc.append(this.text); }
  undo():    void { this.doc.setContent(this.previousContent); }
}

// Concrete Command 2 – delete last N characters
export class DeleteCommand implements Command {
  private deleted = '';
  constructor(private doc: TextDocument, private count: number) {}
  execute(): void {
    const cont = this.doc.getContent();
    this.deleted = cont.slice(-this.count);
    this.doc.setContent(cont.slice(0, -this.count));
  }
  undo(): void { this.doc.append(this.deleted); }
}

// Invoker
export class CommandHistory {
  private history: Command[] = [];
  execute(cmd: Command): void { cmd.execute(); this.history.push(cmd); }
  undo(): void { this.history.pop()?.undo(); }
  getHistorySize(): number { return this.history.length; }
}
