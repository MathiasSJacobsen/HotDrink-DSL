import path from "path";
import { SprottyDiagramIdentifier, SprottyWebview } from "sprotty-vscode";
import { SprottyLspWebview } from "sprotty-vscode/lib/lsp";
import { SprottyLspEditVscodeExtension, LspLabelEditActionHandler, WorkspaceEditActionHandler } from "sprotty-vscode/lib/lsp/editing";
import * as vscode from "vscode";
import { CommonLanguageClient, LanguageClientOptions } from "vscode-languageclient";
import { ServerOptions, TransportKind, LanguageClient } from "vscode-languageclient/node";

export class HotDrinkDSLSprottyVscodeExtension extends SprottyLspEditVscodeExtension {

    constructor(context: vscode.ExtensionContext) {
        // Provide a prefix for registered commands (see further below)
        super("hot-drink-dsl", context);
    }

    protected getDiagramType(args: any[]): string | undefined {
        if (
            args.length === 0 ||
            // Check the file extension if the view is created for a source file
            (args[0] instanceof vscode.Uri && args[0].path.endsWith(".hd"))
        ) {
            // Return a Sprotty diagram type (this info is passed to the Sprotty model source)
            return "hot-drink-dsl-diagram";
        }
        return undefined;
    }

    createWebView(identifier: SprottyDiagramIdentifier): SprottyWebview {
        const webview =  new SprottyLspWebview({
            extension: this,
            identifier,
            // Root paths from which the webview can load local resources using URIs
            localResourceRoots: [this.getExtensionFileUri("pack")],
            // Path to the bundled webview implementation
            scriptUri: this.getExtensionFileUri("pack", "webview.js"),
            // Change this to `true` to enable a singleton view
            singleton: false,
        });

        webview.addActionHandler(WorkspaceEditActionHandler);
        webview.addActionHandler(LspLabelEditActionHandler);
        return webview;
    }

    protected activateLanguageClient(
        context: vscode.ExtensionContext
    ): CommonLanguageClient {
        const serverModule = context.asAbsolutePath(path.join('pack', 'language-server'));
        // The debug options for the server
        // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
        // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
        const debugOptions = { execArgv: ['--nolazy', `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`] };

        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        const serverOptions: ServerOptions = {
            run: { module: serverModule, transport: TransportKind.ipc },
            debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
        };

        const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.hd');
        context.subscriptions.push(fileSystemWatcher);

        // Options to control the language client
        const clientOptions: LanguageClientOptions = {
            documentSelector: [{ scheme: 'file', language: 'hot-drink-dsl' }],
            synchronize: {
                // Notify the server about file changes to files contained in the workspace
                fileEvents: fileSystemWatcher
            }
        };

        // Create the language client and start the client.
        const languageClient = new LanguageClient(
            'hot-drink-dsl',
            'HotDrink DSL',
            serverOptions,
            clientOptions
        );

        // Start the client. This will also launch the server
        context.subscriptions.push(languageClient.start());
        return languageClient;
    }
}
