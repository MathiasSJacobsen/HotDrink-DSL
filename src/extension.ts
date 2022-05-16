import * as vscode from 'vscode';
import { SprottyLspVscodeExtension } from 'sprotty-vscode/lib/lsp';
import { HotDrinkDSLSprottyVscodeExtension } from './sprotty/hot-drink-dsl-sprotty-lsp-extension';
import { CliTaskProvider } from './cli/cli-task-provider';

let extension: SprottyLspVscodeExtension;
let cliTaskProvider: vscode.Disposable | undefined;

// This function is called when the extension is activated.
export function activate(context: vscode.ExtensionContext): void {
    //client = startLanguageClient(context);
    extension = new HotDrinkDSLSprottyVscodeExtension(context);

    const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
    if (!workspaceRoot){
        return;
    }
    cliTaskProvider = vscode.tasks.registerTaskProvider(CliTaskProvider.CliTaskType, new CliTaskProvider(workspaceRoot));
}

// This function is called when the extension is deactivated.
export function deactivate(): Thenable<void> | undefined {
    if (cliTaskProvider){
        cliTaskProvider.dispose();
    }
    if (extension) {
        return Promise.resolve(); //client.stop();
    }
    return undefined;
}
