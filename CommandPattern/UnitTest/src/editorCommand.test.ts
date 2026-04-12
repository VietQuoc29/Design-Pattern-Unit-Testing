import { TextDocument, TypeCommand, DeleteCommand, CommandHistory } from './editorCommand';

describe('Text Editor Commands', () => {

  let doc:     TextDocument;
  let history: CommandHistory;

  beforeEach(() => { doc = new TextDocument(); history = new CommandHistory(); });

  describe('TypeCommand', () => {
    it('execute() appends text to the document', () => {
      history.execute(new TypeCommand(doc, 'Hello'));
      expect(doc.getContent()).toBe('Hello');
    });

    it('undo() restores the document to its pre-type state', () => {
      history.execute(new TypeCommand(doc, 'Hello'));
      history.undo();
      expect(doc.getContent()).toBe('');
    });

    it('multiple types then a single undo reverts only the last type', () => {
      history.execute(new TypeCommand(doc, 'Hello'));
      history.execute(new TypeCommand(doc, ' World'));
      history.undo();
      expect(doc.getContent()).toBe('Hello');
    });

    it('full undo sequence returns document to empty string', () => {
      history.execute(new TypeCommand(doc, 'A'));
      history.execute(new TypeCommand(doc, 'B'));
      history.undo();
      history.undo();
      expect(doc.getContent()).toBe('');
    });
  });

  describe('DeleteCommand', () => {
    it('execute() removes the last N characters', () => {
      doc.setContent('Hello World');
      history.execute(new DeleteCommand(doc, 5));
      expect(doc.getContent()).toBe('Hello ');
    });

    it('undo() restores the deleted characters', () => {
      doc.setContent('Hello World');
      history.execute(new DeleteCommand(doc, 5));
      history.undo();
      expect(doc.getContent()).toBe('Hello World');
    });

    it('deleting more chars than content length leaves empty string', () => {
      doc.setContent('Hi');
      history.execute(new DeleteCommand(doc, 10));
      expect(doc.getContent()).toBe('');
    });
  });

  describe('CommandHistory (Invoker)', () => {
    it('tracks history size correctly after each execute', () => {
      history.execute(new TypeCommand(doc, 'A'));
      history.execute(new TypeCommand(doc, 'B'));
      expect(history.getHistorySize()).toBe(2);
    });

    it('undo decrements history size', () => {
      history.execute(new TypeCommand(doc, 'A'));
      history.undo();
      expect(history.getHistorySize()).toBe(0);
    });

    it('undo on empty history does not throw', () => {
      expect(() => history.undo()).not.toThrow();
    });
  });

});
