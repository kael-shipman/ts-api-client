import { Prompt } from "prompt-sync";

export abstract class AbstractMenu {
  protected abstract choices: { [i: number]: string };

  public constructor(protected readline: Prompt, protected isChild: boolean) {
  }

  public async showMenu() {
    while (true) {
      let p = "Please select from the menu below:\n";
      let n = 1;
      for (const c in this.choices) {
        p += `\n${c}. ${this.choices[c]}`;
        n = parseInt(c) + 1;
      }
      p += `\n${n}. ${this.isChild ? "Go back" : "Quit"}\n`;

      console.log(p);
      const choice = parseInt(this.readline("Choice: "));

      // If we've chosen the final option, we're quitting this menu
      if (choice === n) {
        break;
      }

      // Otherwise, process the choice
      const result = await this.dispatch(choice);
      if (!result) {
        console.log(`\nOops! Not gonna work. Try again.`);
      }
      console.log(`\n`);
    }
  }

  public abstract async dispatch(choice: number): Promise<boolean>;
}


