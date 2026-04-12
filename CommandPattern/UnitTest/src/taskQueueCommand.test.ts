import { TaskLog, LogTaskCommand, TaskQueue } from './taskQueueCommand';

describe('Task Queue & Macro Commands', () => {

  describe('LogTaskCommand', () => {
    it('execute() adds the task entry to the log', () => {
      const log = new TaskLog();
      new LogTaskCommand(log, 'Send email').execute();
      expect(log.getEntries()).toContain('Send email');
    });

    it('undo() removes the task entry from the log', () => {
      const log = new TaskLog();
      const cmd = new LogTaskCommand(log, 'Send email');
      cmd.execute(); cmd.undo();
      expect(log.getEntries()).not.toContain('Send email');
    });
  });

  describe('TaskQueue (Invoker)', () => {
    it('runNext() executes the first queued command', () => {
      const log   = new TaskLog();
      const queue = new TaskQueue();
      queue.enqueue(new LogTaskCommand(log, 'job-1'));
      queue.runNext();
      expect(log.getEntries()).toContain('job-1');
    });

    it('runAll() drains the entire queue and executes all commands', () => {
      const log   = new TaskLog();
      const queue = new TaskQueue();
      ['A','B','C'].forEach(t => queue.enqueue(new LogTaskCommand(log, t)));
      queue.runAll();
      expect(queue.pendingCount()).toBe(0);
      expect(log.getEntries()).toHaveLength(3);
    });

    it('undoLast() undoes only the most recently executed command', () => {
      const log   = new TaskLog();
      const queue = new TaskQueue();
      queue.enqueue(new LogTaskCommand(log, 'keep'));
      queue.enqueue(new LogTaskCommand(log, 'remove'));
      queue.runAll();
      queue.undoLast();
      expect(log.getEntries()).toContain('keep');
      expect(log.getEntries()).not.toContain('remove');
    });

    it('executedCount() tracks number of completed tasks', () => {
      const log   = new TaskLog();
      const queue = new TaskQueue();
      queue.enqueue(new LogTaskCommand(log, 'x'));
      queue.enqueue(new LogTaskCommand(log, 'y'));
      queue.runAll();
      expect(queue.executedCount()).toBe(2);
    });

    it('mock command – queue calls execute() exactly once per runNext()', () => {
      const mockCmd = { execute: jest.fn(), undo: jest.fn() };
      const queue   = new TaskQueue();
      queue.enqueue(mockCmd);
      queue.runNext();
      expect(mockCmd.execute).toHaveBeenCalledTimes(1);
    });
  });

});
