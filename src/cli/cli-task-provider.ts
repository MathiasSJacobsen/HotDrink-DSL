import colors from 'colors';
import path from 'path';
import * as vscode from 'vscode';
import { generateAction } from './index';



interface CliTaskDefinition extends vscode.TaskDefinition {
    /**
     * The file containing the task.
     */
    file: string;
}

export class CliTaskProvider implements vscode.TaskProvider {
    static CliTaskType: string = 'cli';
    private tasks: vscode.Task[] | undefined;

    // We use a CustomExecution task when state needs to be shared across runs of the task or when 
	// the task requires use of some VS Code API to run.
	// If you don't need to share state between runs and if you don't need to execute VS Code API in your task, 
	// then a simple ShellExecution or ProcessExecution should be enough.
	// Since our build has this shared state, the CustomExecution is used below.
	private sharedState: string | undefined;

    constructor(private workspaceRoot: string) { }

    provideTasks(token: vscode.CancellationToken): vscode.ProviderResult<vscode.Task[]> {
        return this.getTasks();
    }
    resolveTask(_task: vscode.Task): vscode.ProviderResult<vscode.Task> {
        const definition: CliTaskDefinition = <any>_task.definition;
        const file = _task.definition.file;
        if(file) {
            return this.getTask(file, definition);
        }
        
        return undefined;
    }

    private getTasks(): vscode.Task[] {
        if (this.tasks !== undefined) {
			return this.tasks;
		}
        const workspaceFolders = vscode.workspace.workspaceFolders;
        this.tasks = [];
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return this.tasks;
        }
        for (const workspaceFolder of workspaceFolders) {
            const folderString = workspaceFolder.uri.fsPath;
            if (!folderString) {
                continue;
            }
            const hdFile = path.join(folderString, 'anotherone.hd');
            this.tasks!.push(this.getTask(hdFile));
        }
        console.log(`All tasks: ${JSON.stringify(this.tasks)}`);
        
        return this.tasks;
    }

    private getTask(file: string, definition?: CliTaskDefinition): vscode.Task {
        if (!definition){
            definition = {
                type: CliTaskProvider.CliTaskType,
                file: file
            };
            }
            console.log(definition.file);
            
            return new vscode.Task(
                definition, 
                vscode.TaskScope.Workspace, 
                'Test', 
                CliTaskProvider.CliTaskType,
                new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
                    return new CliTaskExecution(this.workspaceRoot, file, () => this.sharedState, (state: string) => this.sharedState = state);
                }));
    }
}

class CliTaskExecution implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    onDidOverrideDimensions?: vscode.Event<vscode.TerminalDimensions | undefined> | undefined;
    private closeEmitter = new vscode.EventEmitter<number>();
    onDidClose?: vscode.Event<number> = this.closeEmitter.event;
    onDidChangeName?: vscode.Event<string> | undefined;

    private fileWatcher: vscode.FileSystemWatcher | undefined;

    constructor(private workspaceRoot: string, private file: string, private getSharedState: () => string | undefined, private setSharedState: (state: string) => void) {
        this.workspaceRoot;
        console.log(`file: ${this.file}`);
        this.getSharedState;
        this.setSharedState;

    }
    open(initialDimensions: vscode.TerminalDimensions | undefined): void {
		// At this point we can start using the terminal.
        /*
		if (this.flags.indexOf('watch') > -1) {
			const pattern = path.join(this.workspaceRoot, 'customBuildFile');
			this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
			this.fileWatcher.onDidChange(() => this.doBuild());
			this.fileWatcher.onDidCreate(() => this.doBuild());
			this.fileWatcher.onDidDelete(() => this.doBuild());
		}
        */
		this.doBuild();
	}
    close(): void {
        if (this.fileWatcher) {
			this.fileWatcher.dispose();
		}
    }

    private doBuild(): Promise<void> {
        return new Promise<void>((resolve) => {
            const date = new Date();
			this.writeEmitter.fire('Starting generation of JavaScript...\r\n');
            this.setSharedState(date.toTimeString() + ' ' + date.toDateString());
			generateAction(this.file, { destination:'/Users/mathias/Desktop/MASTERTHESIS/HotDrink-DSL/example/generated/'})
			this.writeEmitter.fire(colors.green('JavaScript code generated successfully: ${generatedFilePath}'));
            this.closeEmitter.fire(0);
            resolve();
		});
    }
}