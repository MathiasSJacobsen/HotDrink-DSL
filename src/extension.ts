import * as vscode from "vscode";
import { SprottyLspVscodeExtension } from "sprotty-vscode/lib/lsp";
import { HotDrinkDSLSprottyVscodeExtension } from "./sprotty/hot-drink-dsl-sprotty-lsp-extension";
import { generateDemo, generateJavaScript } from "./cli";

let extension: SprottyLspVscodeExtension;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    //client = startLanguageClient(context);
    extension = new HotDrinkDSLSprottyVscodeExtension(context);

    extension.context.subscriptions.push(
        vscode.commands.registerCommand("hot-drink-dsl.generate-javascript", () => {
            try {
                generateJavaScript(vscode.window.activeTextEditor?.document.uri.fsPath!, {
                    destination:
                        vscode.workspace.workspaceFolders![0].uri.fsPath + "/generated",
                });
            } catch (error: any) {
                vscode.window.showErrorMessage(error.message);
            }
        })
    );

    extension.context.subscriptions.push(
        vscode.commands.registerCommand("hot-drink-dsl.generate-demo", async () => {
            /*
            const temp = await vscode.window.showInputBox({
                title: "Enter the name of the file to generate",
                placeHolder: "demo.html",
                value: "demo.html",
            });
            */
            try {
                generateDemo(vscode.window.activeTextEditor?.document.uri.fsPath!,{})
            } catch (error: any) {
                vscode.window.showErrorMessage(error.message);
            }
        })
    );
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (extension) {
        return Promise.resolve(); //client.stop();
    }
    return undefined;
}
