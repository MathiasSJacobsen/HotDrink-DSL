import { AstNode, CodeActionProvider, LangiumDocument, MaybePromise } from "langium";
import { CodeAction, CodeActionKind, Command, Diagnostic } from "vscode-languageserver-types";
import { CodeActionParams } from 'vscode-languageserver-protocol';
import { IssueCodes } from "./hot-drink-dsl-validator";



export class HotDrinkDslActionProvider implements CodeActionProvider {

    getCodeActions(document: LangiumDocument<AstNode>, params: CodeActionParams): MaybePromise<(Command | CodeAction)[] | undefined> {
        const result: CodeAction[] = [];
        for (const diagnostic of params.context.diagnostics) {
            const codeAction = this.createCodeAction(diagnostic, document);
            if (codeAction) {
                result.push(codeAction);
            }
        }
        return result;
    }
    
    private createCodeAction(diagnostic: Diagnostic, document: LangiumDocument): CodeAction | undefined {
        switch (diagnostic.code) {
            case IssueCodes.VarNameUpperCase:
                return this.makeLowerCase(diagnostic, document)
            default:
                return undefined;
        }
    }

    private makeLowerCase(diagnostic: Diagnostic, document: LangiumDocument): CodeAction | undefined {
        const range = {
            start: diagnostic.range.start, 
            end: {
                line: diagnostic.range.start.line, 
                character: diagnostic.range.start.character + 1
            }
        };
        
        return {
            title: 'First letter to lower case',
            kind: CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            isPreferred: true,
            edit: {
                changes: {
                    [document.textDocument.uri]: [{
                        range,
                        newText: document.textDocument.getText(range).toLowerCase()
                    }]
                }
            }
        };
    }

}