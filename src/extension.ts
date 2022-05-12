import * as vscode from 'vscode';
import { SprottyLspVscodeExtension } from 'sprotty-vscode/lib/lsp';
import { HotDrinkDSLSprottyVscodeExtension } from './sprotty/hot-drink-dsl-sprotty-lsp-extension';

let extension: SprottyLspVscodeExtension;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    //client = startLanguageClient(context);
    extension = new HotDrinkDSLSprottyVscodeExtension(context);
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (extension) {
        return Promise.resolve(); //client.stop();
    }
    return undefined;
}
