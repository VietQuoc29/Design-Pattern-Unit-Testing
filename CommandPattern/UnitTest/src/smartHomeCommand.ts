export interface Command { execute(): void; undo(): void; }

// Receivers
export class Light {
  private on = false;
  turnOn():  void    { this.on = true; }
  turnOff(): void    { this.on = false; }
  isOn():    boolean { return this.on; }
}

export class AirConditioner {
  private temp = 20;
  setTemp(t: number): void { this.temp = t; }
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
  private previousTemp = 20;
  constructor(private airConditioner: AirConditioner, private newTemp: number) {}
  execute(): void { this.previousTemp = this.airConditioner.getTemp(); this.airConditioner.setTemp(this.newTemp); }
  undo():    void { this.airConditioner.setTemp(this.previousTemp); }
}

// Invoker – one undo slot (last command only)
export class RemoteControl {
  private lastCommand: Command | null = null;
  press(cmd: Command): void { cmd.execute(); this.lastCommand = cmd; }
  pressUndo(): void         { this.lastCommand?.undo(); }
}
