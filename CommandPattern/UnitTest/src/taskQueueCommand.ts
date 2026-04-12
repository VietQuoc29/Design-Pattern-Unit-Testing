export interface Command { execute(): void; undo(): void; }

// Receiver
export class TaskLog {
  private entries: string[] = [];
  add(entry: string): void    { this.entries.push(entry); }
  remove(entry: string): void { this.entries = this.entries.filter(e => e !== entry); }
  getEntries(): string[]      { return [...this.entries]; }
}

// Concrete Command – log a single task
export class LogTaskCommand implements Command {
  constructor(private log: TaskLog, private task: string) {}
  execute(): void { this.log.add(this.task); }
  undo():    void { this.log.remove(this.task); }
}

// Invoker – sequential task queue with undo support
export class TaskQueue {
  private queue:    Command[] = [];
  private executed: Command[] = [];

  enqueue(cmd: Command): void  { this.queue.push(cmd); }
  runNext(): void {
    const cmd = this.queue.shift();
    if (cmd) { cmd.execute(); this.executed.push(cmd); }
  }
  runAll(): void       { while (this.queue.length) this.runNext(); }
  undoLast(): void     { this.executed.pop()?.undo(); }
  pendingCount(): number  { return this.queue.length; }
  executedCount(): number { return this.executed.length; }
}
