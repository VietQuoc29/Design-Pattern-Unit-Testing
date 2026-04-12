1. # **Command Pattern**

   1. ## **Definition**

The Command Pattern turns a request into a stand-alone object that contains all information about the request: the action to perform, the receiver to act on, and the parameters needed. This decouples the object that invokes the operation from the object that knows how to perform it.

Instead of calling a method directly, you wrap that call inside a Command object and pass it around. The invoker only knows how to call execute() (and optionally undo()); it has no knowledge of what the command actually does.

2. ## **Structure**

The Command Pattern consists of five main components:

- Command Interface: Declares execute() and optionally undo(). This is the contract every concrete command must fulfil.

- Concrete Command: Implements the Command interface. Holds a reference to the Receiver and calls its specific methods inside execute() and undo().

- Receiver: The object that performs the actual work. It contains the real business logic (e.g., a TextEditor, a Light, a Queue).

- Invoker: Holds and executes commands. It has no knowledge of what a command does – it simply calls execute(). May maintain a history stack for undo/redo.

- Client: Creates Concrete Command objects, binds them to a Receiver, and passes them to the Invoker.

  3. ## **Applicability**

- Want to parameterize objects with operations.  
- Want to queue operations, schedule their execution, or execute them remotely.  
- Want to implement reversible operations.

  4. ## **Pros and cons**

| Prospects | Consequences |
| :---- | :---- |
| Single Responsibility Principle | Code may become more complicated since you’re introducing a whole new layer between senders and receivers |
| Open/Closed Principle |  |
| Can implement undo/redo |  |
| Can implement deferred execution of operations |  |
| Can assemble a set of simple commands into a complex one |  |

# 

2. # **Ex1 \- Text Editor (Undo/Redo)** 

## **Describe**

A text editor supports type, delete, and bold/unbold operations. Each action is a Command that stores enough information to undo itself. The CommandHistory (Invoker) manages an undo stack, allowing the user to roll back any sequence of operations.

## **Source code: editorCommand.ts**

export interface Command { execute(): void; undo(): void; }

// Receiver  
export class TextDocument {  
  private content \= '';  
  getContent(): string          { return this.content; }  
  setContent(c: string): void   { this.content \= c; }  
  append(text: string): void    { this.content \+= text; }  
}

// Concrete Command 1 – type text  
export class TypeCommand implements Command {  
  private previousContent \= '';  
  constructor(private doc: TextDocument, private text: string) {}  
  execute(): void { this.previousContent \= this.doc.getContent(); this.doc.append(this.text); }  
  undo():    void { this.doc.setContent(this.previousContent); }  
}

// Concrete Command 2 – delete last N characters  
export class DeleteCommand implements Command {  
  private deleted \= '';  
  constructor(private doc: TextDocument, private count: number) {}  
  execute(): void {  
    const cont \= this.doc.getContent();  
    this.deleted \= cont.slice(\-this.count);  
    this.doc.setContent(cont.slice(0, \-this.count));  
  }  
  undo(): void { this.doc.append(this.deleted); }  
}

// Invoker  
export class CommandHistory {  
  private history: Command\[\] \= \[\];  
  execute(cmd: Command): void { cmd.execute(); this.history.push(cmd); }  
  undo(): void { this.history.pop()?.undo(); }  
  getHistorySize(): number { return this.history.length; }  
}

## **Source code: editorCommand.test.ts**

import { TextDocument, TypeCommand, DeleteCommand, CommandHistory } from './editorCommand';

describe('Text Editor Commands', () \=\> {

  let doc:     TextDocument;  
  let history: CommandHistory;

  beforeEach(() \=\> { doc \= new TextDocument(); history \= new CommandHistory(); });

  describe('TypeCommand', () \=\> {  
    it('execute() appends text to the document', () \=\> {  
      history.execute(new TypeCommand(doc, 'Hello'));  
      expect(doc.getContent()).toBe('Hello');  
    });

    it('undo() restores the document to its pre-type state', () \=\> {  
      history.execute(new TypeCommand(doc, 'Hello'));  
      history.undo();  
      expect(doc.getContent()).toBe('');  
    });

    it('multiple types then a single undo reverts only the last type', () \=\> {  
      history.execute(new TypeCommand(doc, 'Hello'));  
      history.execute(new TypeCommand(doc, ' World'));  
      history.undo();  
      expect(doc.getContent()).toBe('Hello');  
    });

    it('full undo sequence returns document to empty string', () \=\> {  
      history.execute(new TypeCommand(doc, 'A'));  
      history.execute(new TypeCommand(doc, 'B'));  
      history.undo();  
      history.undo();  
      expect(doc.getContent()).toBe('');  
    });  
  });

  describe('DeleteCommand', () \=\> {  
    it('execute() removes the last N characters', () \=\> {  
      doc.setContent('Hello World');  
      history.execute(new DeleteCommand(doc, 5));  
      expect(doc.getContent()).toBe('Hello ');  
    });

    it('undo() restores the deleted characters', () \=\> {  
      doc.setContent('Hello World');  
      history.execute(new DeleteCommand(doc, 5));  
      history.undo();  
      expect(doc.getContent()).toBe('Hello World');  
    });

    it('deleting more chars than content length leaves empty string', () \=\> {  
      doc.setContent('Hi');  
      history.execute(new DeleteCommand(doc, 10));  
      expect(doc.getContent()).toBe('');  
    });  
  });

  describe('CommandHistory (Invoker)', () \=\> {  
    it('tracks history size correctly after each execute', () \=\> {  
      history.execute(new TypeCommand(doc, 'A'));  
      history.execute(new TypeCommand(doc, 'B'));  
      expect(history.getHistorySize()).toBe(2);  
    });

    it('undo decrements history size', () \=\> {  
      history.execute(new TypeCommand(doc, 'A'));  
      history.undo();  
      expect(history.getHistorySize()).toBe(0);  
    });

    it('undo on empty history does not throw', () \=\> {  
      expect(() \=\> history.undo()).not.toThrow();  
    });  
  });

});

3. # **Ex2 \- Smart Home Controller**

## **Describe**

A smart home app has a RemoteControl (Invoker) with buttons mapped to Commands. Each button press executes a command (turn light on/off, set thermostat temperature). The same RemoteControl works for any device without knowing its internal API.

## **Source code: smartHomeCommand.ts**

export interface Command { execute(): void; undo(): void; }

// Receivers  
export class Light {  
  private on \= false;  
  turnOn():  void    { this.on \= true; }  
  turnOff(): void    { this.on \= false; }  
  isOn():    boolean { return this.on; }  
}

export class AirConditioner {  
  private temp \= 20;  
  setTemp(t: number): void { this.temp \= t; }  
  getTemp(): number         { return this.temp; }  
}

// Concrete Commands – Light  
export class TurnLightOnCommand implements Command {  
  constructor(private light: Light) {}  
  execute(): void { this.light.turnOn(); }  
  undo():    void { this.light.turnOff(); }  
}

export class TurnLightOffCommand implements Command {  
  constructor(private light: Light) {}  
  execute(): void { this.light.turnOff(); }  
  undo():    void { this.light.turnOn(); }  
}

// Concrete Command – Air Conditioner (stores previous state for undo)  
export class SetAirConditionerCommand implements Command {  
  private previousTemp \= 20;  
  constructor(private airConditioner: AirConditioner, private newTemp: number) {}  
  execute(): void { this.previousTemp \= this.airConditioner.getTemp(); this.airConditioner.setTemp(this.newTemp); }  
  undo():    void { this.airConditioner.setTemp(this.previousTemp); }  
}

// Invoker – one undo slot (last command only)  
export class RemoteControl {  
  private lastCommand: Command | null \= null;  
  press(cmd: Command): void { cmd.execute(); this.lastCommand \= cmd; }  
  pressUndo(): void         { this.lastCommand?.undo(); }  
}

## **Source code: smartHomeCommand.test.ts**

import {  
  Light, AirConditioner,  
  TurnLightOnCommand, TurnLightOffCommand,  
  SetAirConditionerCommand, RemoteControl, Command,  
} from './smartHomeCommand';

describe('Smart Home Command', () \=\> {

  describe('TurnLightOnCommand', () \=\> {  
    it('execute() turns the light on', () \=\> {  
      const light \= new Light();  
      new TurnLightOnCommand(light).execute();  
      expect(light.isOn()).toBe(true);  
    });

    it('undo() turns the light back off', () \=\> {  
      const light \= new Light();  
      const cmd   \= new TurnLightOnCommand(light);  
      cmd.execute(); cmd.undo();  
      expect(light.isOn()).toBe(false);  
    });  
  });

  describe('TurnLightOffCommand', () \=\> {  
    it('execute() turns an on light off; undo() restores it', () \=\> {  
      const light \= new Light();  
      light.turnOn();  
      const cmd \= new TurnLightOffCommand(light);  
      cmd.execute();  
      expect(light.isOn()).toBe(false);  
      cmd.undo();  
      expect(light.isOn()).toBe(true);  
    });  
  });

  describe('SetAirConditionerCommand', () \=\> {  
    it('execute() applies the new temperature', () \=\> {  
      const airCon \= new AirConditioner();  
      new SetAirConditionerCommand(airCon, 24).execute();  
      expect(airCon.getTemp()).toBe(24);  
    });

    it('undo() restores the previous temperature', () \=\> {  
      const airCon \= new AirConditioner();  
      airCon.setTemp(20);  
      const cmd \= new SetAirConditionerCommand(airCon, 26);  
      cmd.execute(); cmd.undo();  
      expect(airCon.getTemp()).toBe(20);  
    });  
  });

  describe('RemoteControl (Invoker)', () \=\> {  
    it('press() executes the given command', () \=\> {  
      const light  \= new Light();  
      const remote \= new RemoteControl();  
      remote.press(new TurnLightOnCommand(light));  
      expect(light.isOn()).toBe(true);  
    });

    it('pressUndo() calls undo on the last pressed command', () \=\> {  
      const light  \= new Light();  
      const remote \= new RemoteControl();  
      remote.press(new TurnLightOnCommand(light));  
      remote.pressUndo();  
      expect(light.isOn()).toBe(false);  
    });

    it('invoker works with any Command – fully decoupled from receiver', () \=\> {  
      const light  \= new Light();  
      const airCon \= new AirConditioner();  
      const remote \= new RemoteControl();  
      remote.press(new TurnLightOnCommand(light));  
      remote.press(new SetAirConditionerCommand(airCon, 22));  
      expect(light.isOn()).toBe(true);  
      expect(airCon.getTemp()).toBe(22);  
    });

    it('mock command – invoker calls execute() exactly once per press', () \=\> {  
      const mockCmd: Command \= { execute: jest.fn(), undo: jest.fn() };  
      new RemoteControl().press(mockCmd);  
      expect(mockCmd.execute).toHaveBeenCalledTimes(1);  
      expect(mockCmd.undo).not.toHaveBeenCalled();  
    });

    it('pressUndo() without a prior press does not throw', () \=\> {  
      expect(() \=\> new RemoteControl().pressUndo()).not.toThrow();  
    });  
  });

});

4. # **Ex3 \- Task Queue**

## **Describe**

A job scheduler needs to queue tasks, execute them in order, and support batch (macro) commands that group multiple tasks into one atomic operation.

## **Source code: taskQueueCommand.ts**

export interface Command { execute(): void; undo(): void; }

// Receiver  
export class TaskLog {  
  private entries: string\[\] \= \[\];  
  add(entry: string): void    { this.entries.push(entry); }  
  remove(entry: string): void { this.entries \= this.entries.filter(e \=\> e \!== entry); }  
  getEntries(): string\[\]      { return \[...this.entries\]; }  
}

// Concrete Command – log a single task  
export class LogTaskCommand implements Command {  
  constructor(private log: TaskLog, private task: string) {}  
  execute(): void { this.log.add(this.task); }  
  undo():    void { this.log.remove(this.task); }  
}

// Invoker – sequential task queue with undo support  
export class TaskQueue {  
  private queue:    Command\[\] \= \[\];  
  private executed: Command\[\] \= \[\];

  enqueue(cmd: Command): void  { this.queue.push(cmd); }  
  runNext(): void {  
    const cmd \= this.queue.shift();  
    if (cmd) { cmd.execute(); this.executed.push(cmd); }  
  }  
  runAll(): void       { while (this.queue.length) this.runNext(); }  
  undoLast(): void     { this.executed.pop()?.undo(); }  
  pendingCount(): number  { return this.queue.length; }  
  executedCount(): number { return this.executed.length; }  
}

## **Source code: taskQueueCommand.test.ts**

import { TaskLog, LogTaskCommand, TaskQueue } from './taskQueueCommand';

describe('Task Queue & Macro Commands', () \=\> {

  describe('LogTaskCommand', () \=\> {  
    it('execute() adds the task entry to the log', () \=\> {  
      const log \= new TaskLog();  
      new LogTaskCommand(log, 'Send email').execute();  
      expect(log.getEntries()).toContain('Send email');  
    });

    it('undo() removes the task entry from the log', () \=\> {  
      const log \= new TaskLog();  
      const cmd \= new LogTaskCommand(log, 'Send email');  
      cmd.execute(); cmd.undo();  
      expect(log.getEntries()).not.toContain('Send email');  
    });  
  });

  describe('TaskQueue (Invoker)', () \=\> {  
    it('runNext() executes the first queued command', () \=\> {  
      const log   \= new TaskLog();  
      const queue \= new TaskQueue();  
      queue.enqueue(new LogTaskCommand(log, 'job-1'));  
      queue.runNext();  
      expect(log.getEntries()).toContain('job-1');  
    });

    it('runAll() drains the entire queue and executes all commands', () \=\> {  
      const log   \= new TaskLog();  
      const queue \= new TaskQueue();  
      \['A','B','C'\].forEach(t \=\> queue.enqueue(new LogTaskCommand(log, t)));  
      queue.runAll();  
      expect(queue.pendingCount()).toBe(0);  
      expect(log.getEntries()).toHaveLength(3);  
    });

    it('undoLast() undoes only the most recently executed command', () \=\> {  
      const log   \= new TaskLog();  
      const queue \= new TaskQueue();  
      queue.enqueue(new LogTaskCommand(log, 'keep'));  
      queue.enqueue(new LogTaskCommand(log, 'remove'));  
      queue.runAll();  
      queue.undoLast();  
      expect(log.getEntries()).toContain('keep');  
      expect(log.getEntries()).not.toContain('remove');  
    });

    it('executedCount() tracks number of completed tasks', () \=\> {  
      const log   \= new TaskLog();  
      const queue \= new TaskQueue();  
      queue.enqueue(new LogTaskCommand(log, 'x'));  
      queue.enqueue(new LogTaskCommand(log, 'y'));  
      queue.runAll();  
      expect(queue.executedCount()).toBe(2);  
    });

    it('mock command – queue calls execute() exactly once per runNext()', () \=\> {  
      const mockCmd \= { execute: jest.fn(), undo: jest.fn() };  
      const queue   \= new TaskQueue();  
      queue.enqueue(mockCmd);  
      queue.runNext();  
      expect(mockCmd.execute).toHaveBeenCalledTimes(1);  
    });  
  });

});

