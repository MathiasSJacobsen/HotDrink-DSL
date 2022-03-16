import fs from "fs";
import colors from "colors"
import { CompositeGeneratorNode, NL, processGeneratorNode } from "langium";
import {

    BooleanValueExpr,
    Component,
    Constraint,
    Import,
    ImportedFunction,
    Method,
    Model,
    NumberValueExpr,
    StringValueExpr,
    Variable,
    VariableReference,
    Vars,
} from "../language-server/generated/ast";
import { extractDestinationAndName } from "./cli-util";
import path from "path";
import { NAMETAKEN, NONENAMEGIVEN, uid, usedVariableNames, variableIndex } from "../utils";

export function generateJavaScript(
    model: Model,
    filePath: string,
    destination: string | undefined
): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('"use strict";', NL, NL);

   // const usedVariableNames = new Set<string>()
    // const variableIndex = new Map<string, number>()

    generateImports(model.imports, fileNode);
    fileNode.append(NL);

    generateComponent(model, fileNode)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

function generateImports(imports: Import[], fileNode: CompositeGeneratorNode) {
    imports.forEach((_import: Import) =>
        fileNode.append(
            `import { ${_import.imports
                .map((func: ImportedFunction) => {
                    if(func.altName) return `${func.function.name} as ${func.altName.name}`
                    else return `${func.function.name}`
                })
                .join(", ")} } from ${_import.file};`,
            NL
        )
    );
}

function generateComponent(model: Model, fileNode: CompositeGeneratorNode) {
    model.component.forEach((component: Component) => {
        const compName = !usedVariableNames.has(component.name) ? component.name : `${NAMETAKEN}${uid()}`
        usedVariableNames.add(compName)

        fileNode.append(`let ${compName} = new Component("${compName}")`, NL)
        generateVariables(component, fileNode)

        generateConstraintSpec(component, fileNode)
        fileNode.append(NL)


     });
}

function generateVariables(component:Component, fileNode: CompositeGeneratorNode) {
    let arrayIdx = 0;
    component.variables.forEach((vars: Vars) => {
        vars.vars.forEach((variable: Variable) => {
            fileNode.append(`let ${variable.name} = ${component.name}.emplaceVariable("${variable.name}"`)
            variableIndex.set(variable.name, arrayIdx++)
            if(variable.initValue) {
                if(variable.initValue.$type === "NumberValueExpr") {
                    const initValue = variable.initValue as NumberValueExpr 
                    fileNode.append(`, ${initValue.digit}`)
                    if(initValue.decimal){
                        fileNode.append(`.${initValue.decimal}`)
                    }
                } else if (variable.initValue.$type === "StringValueExpr") {
                    const initValue = variable.initValue as StringValueExpr 
                    fileNode.append(`, ${initValue.val}`)
                } else if (variable.initValue.$type === "BooleanValueExpr") {
                    const initValue = variable.initValue as BooleanValueExpr 
                    fileNode.append(`, ${initValue.val}`)
                } else console.log(colors.red("Unknown init value type"))

            }
            fileNode.append(')', NL)
        })
    })
    console.log(variableIndex);
    
}

function generateConstraintSpec(component:Component, fileNode: CompositeGeneratorNode) {
    component.constraints.forEach((constraint: Constraint) => {
        fileNode.append(NL)
        fileNode.append(`// create a constraint spec`, NL)
        const constraintName = constraint.name || `c${NONENAMEGIVEN}${uid()}`
        let methodNames: string[] = []
        constraint.methods.forEach((method: Method) => {
            methodNames = generateMethods(method, fileNode)
        })
        fileNode.append(NL)
        fileNode.append(`let ${constraintName}Spec = new ConstraintSpec([${methodNames.map((name:string) => name)}])`, NL)
    })
}

function generateMethods(method:Method, fileNode: CompositeGeneratorNode): string[] {
    const methodNames: string[] = []
    const methodName = method.name || `m${NONENAMEGIVEN}${uid()}`
    const nvars = method.signature.inputVariables.length + method.signature.outputVariables.length
    const ins = method.signature.inputVariables.map((variableRef: VariableReference) => variableIndex.get(variableRef.ref.ref?.name!))
    const outs = method.signature.outputVariables.map((variableRef: VariableReference) => variableIndex.get(variableRef.ref.ref?.name!))
    const promiseMask = ["MaskNone"]
    const code = "Need fixing"

    fileNode.append(`let ${methodName} = new Method(${nvars}, [${ins}], [${outs}], [${promiseMask}], "${code}")`, NL)
    methodNames.push(methodName)
    return methodNames
}
