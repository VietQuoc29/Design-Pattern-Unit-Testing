import {
  Light, AirConditioner,
  TurnLightOnCommand, TurnLightOffCommand,
  SetAirConditionerCommand, RemoteControl, Command,
} from './smartHomeCommand';

describe('Smart Home Command', () => {

  describe('TurnLightOnCommand', () => {
    it('execute() turns the light on', () => {
      const light = new Light();
      new TurnLightOnCommand(light).execute();
      expect(light.isOn()).toBe(true);
    });

    it('undo() turns the light back off', () => {
      const light = new Light();
      const cmd   = new TurnLightOnCommand(light);
      cmd.execute(); cmd.undo();
      expect(light.isOn()).toBe(false);
    });
  });

  describe('TurnLightOffCommand', () => {
    it('execute() turns an on light off; undo() restores it', () => {
      const light = new Light();
      light.turnOn();
      const cmd = new TurnLightOffCommand(light);
      cmd.execute();
      expect(light.isOn()).toBe(false);
      cmd.undo();
      expect(light.isOn()).toBe(true);
    });
  });

  describe('SetAirConditionerCommand', () => {
    it('execute() applies the new temperature', () => {
      const airCon = new AirConditioner();
      new SetAirConditionerCommand(airCon, 24).execute();
      expect(airCon.getTemp()).toBe(24);
    });

    it('undo() restores the previous temperature', () => {
      const airCon = new AirConditioner();
      airCon.setTemp(20);
      const cmd = new SetAirConditionerCommand(airCon, 26);
      cmd.execute(); cmd.undo();
      expect(airCon.getTemp()).toBe(20);
    });
  });

  describe('RemoteControl (Invoker)', () => {
    it('press() executes the given command', () => {
      const light  = new Light();
      const remote = new RemoteControl();
      remote.press(new TurnLightOnCommand(light));
      expect(light.isOn()).toBe(true);
    });

    it('pressUndo() calls undo on the last pressed command', () => {
      const light  = new Light();
      const remote = new RemoteControl();
      remote.press(new TurnLightOnCommand(light));
      remote.pressUndo();
      expect(light.isOn()).toBe(false);
    });

    it('invoker works with any Command – fully decoupled from receiver', () => {
      const light  = new Light();
      const airCon = new AirConditioner();
      const remote = new RemoteControl();
      remote.press(new TurnLightOnCommand(light));
      remote.press(new SetAirConditionerCommand(airCon, 22));
      expect(light.isOn()).toBe(true);
      expect(airCon.getTemp()).toBe(22);
    });

    it('mock command – invoker calls execute() exactly once per press', () => {
      const mockCmd: Command = { execute: jest.fn(), undo: jest.fn() };
      new RemoteControl().press(mockCmd);
      expect(mockCmd.execute).toHaveBeenCalledTimes(1);
      expect(mockCmd.undo).not.toHaveBeenCalled();
    });

    it('pressUndo() without a prior press does not throw', () => {
      expect(() => new RemoteControl().pressUndo()).not.toThrow();
    });
  });

});
