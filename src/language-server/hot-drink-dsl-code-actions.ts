import { AstNode, CodeActionProvider, LangiumDocument, MaybePromise } from "langium";
import { CodeAction, CodeActionKind, Command, Diagnostic } from "vscode-languageserver-types";
import { CodeActionParams } from 'vscode-languageserver-protocol';
import { IssueCodes } from "./hot-drink-dsl-validator";
import { Model } from "./generated/ast";



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
            case IssueCodes.Permutations:
                return this.makePermutations(diagnostic, document)
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
        const ast = document.parseResult.value as Model
        console.log(ast.components[0].constraints[1].methods.length);
        
        
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

    private makePermutations(diagnostic: Diagnostic, document: LangiumDocument): CodeAction | undefined {
        const range = diagnostic.range;
        function getArrayMutations(arr:string[], perms: string[][] = [], len = arr.length) {
            if (len === 1) perms.push(arr.slice(0))
          
            for (let i = 0; i < len; i++) {
              getArrayMutations(arr, perms, len - 1)
          
              len % 2 // parity dependent adjacent elements swap
                ? [arr[0], arr[len - 1]] = [arr[len - 1], arr[0]]
                : [arr[i], arr[len - 1]] = [arr[len - 1], arr[i]]
            }
          
            return perms
          }
        const model = document.parseResult.value as Model;
        const indexes = (diagnostic.data as string).split("."); // See hintToMakePermutations in hot-drink-dsl-validator.ts
        const method = model.components[parseInt(indexes[1])].constraints[parseInt(indexes[0])].methods[0];
        const inputVariables = method.signature.inputVariables.map(v => v.ref.ref?.name) as string[];
        const outVariables = method.signature.outputVariables.map(v => v.ref.ref?.name) as string[];
        const variables = [...inputVariables, ...outVariables];
        
        let perm: string[][] = []
        getArrayMutations(variables, perm);

        //perm = perm.filter((v, i) => i % 2 === 0); // Do not need the same permutation with the same input variables
        const inputs = perm.map(v => v.slice(0,-outVariables.length).join(", "));
        const outputs = perm.map(v => v.slice(-outVariables.length).join(", "));

        const title = inputs.map((v, i) => {
            return "    (" + v + " -> " + outputs[i] + ")" +  " => " + "'Implementation missing';"
        }).slice(1); // Slice on so we dont overwrite the first line that has already been written
        return {
            title: 'Make permutations',
            kind: CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            isPreferred: true,
            edit: {
                changes: {
                    [document.textDocument.uri]: [{
                        range,
                        newText: document.textDocument.getText(range) + "\n" + title.join("\n")
                    }]
                }
            }
        };
    }
}
