import { readAll } from 'https://deno.land/std@0.104.0/io/util.ts';
import Scanner from './Scanner.ts';
import Token from './Token.ts';

export default class Lox {
  static hadError = false;

  static main(args: string[]) {
    if (args.length > 1) {
      console.log('Usage: jlox [script]');
      Deno.exit(64);
    } else if (args.length == 1) {
      this.runFile(args[0]);
    } else {
      this.runPrompt();
    }
  }

  static async runFile(path: string) {
    const file = await Deno.open(path);
    const bytes = await readAll(file);
    this.run(new TextDecoder().decode(bytes));
  }

  static async runPrompt() {
    for (;;) {
      const line = prompt('> ');
      if (line == null) break;
      await this.run(line);
    }
  }

  static run(source: string) {
    const scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();

    // For now, just print the tokens.
    for (const token of tokens) {
      console.log(token);
    }
  }

  static error(line: number, message: string) {
    Lox.report(line, '', message);
  }

  static report(line: number, where: string, message: string) {
    console.error('[line ' + line + '] Error' + where + ': ' + message);
    this.hadError = true;
  }
}

Lox.main(Deno.args);
