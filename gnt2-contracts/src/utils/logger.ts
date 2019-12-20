export interface Logger {
  log: (text: string) => void;
}

export class ConsoleLogger implements Logger {
  log(text: string) {
    console.log(text);
  };
}
