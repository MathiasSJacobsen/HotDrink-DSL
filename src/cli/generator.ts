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
import { NAMETAKEN, NONENAMEGIVEN, SpecPrefix, uid, usedVariableNames, variableIndex } from "../utils";

export function generateJavaScript(
    model: Model,
    filePath: string,
    destination: string | undefined
): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('"use strict";', NL, NL);

    generateImports(model.imports, fileNode);
    fileNode.append(NL);

    generateComponent(model.components, fileNode)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

/**
 * Append imports to the file-node.
 * @param imports The imports that should be added to the file.
 * @param fileNode The file-node that are being appended to.
 */
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

/**
 * Appends components to the file-node.
 * @param components The components that should be added to the file.
 * @param fileNode The file-node that are being appended to.
 */
function generateComponent(components: Component[], fileNode: CompositeGeneratorNode) {
    components.forEach((component: Component) => {
        fileNode.append("// create a component and emplace some variables", NL)
        const compName = !usedVariableNames.has(component.name) ? component.name : `${NAMETAKEN}${uid()}`
        usedVariableNames.add(compName)

        fileNode.append(`let ${compName} = new Component("${compName}")`, NL)

        generateVariables(component, fileNode)

        const constrainSpecNames = generateConstraintSpec(component.constraints, fileNode)
        fileNode.append(NL)

        generateConstraints(component, fileNode, constrainSpecNames)
        


     });
}

/**
 * Appends the variables in a component to the file-node
 * @param component The component holding the variables.
 * @param fileNode The file-node that are being appended to.
 */
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

/**
 * Append all the constraint specifications to the file-node.
 * @param constraints The constraints that holds the information regarding the specification.
 * @param fileNode The file-node that are being appended to.
 * @returns The variable names of all the constraint specifications.
 */
function generateConstraintSpec(constraints: Constraint[], fileNode: CompositeGeneratorNode): string[] {
    const constrainSpecNames: string[] = []
    constraints.forEach((constraint: Constraint) => {
        fileNode.append(NL)
        fileNode.append(`// create a constraint spec`, NL)
        const constraintName = constraint.name || `cs${NONENAMEGIVEN}${uid()}`
        let methodNames: string[] = []
        constraint.methods.forEach((method: Method) => {
            methodNames.push(generateMethod(method, fileNode))
        })
        fileNode.append(NL)
        fileNode.append(`let ${constraintName+SpecPrefix} = new ConstraintSpec([${methodNames.map((name:string) => name)}])`, NL)
        constrainSpecNames.push(constraintName+SpecPrefix)
    })
    return constrainSpecNames
}

/**
 * Append the method to the file-node.
 * @param method The method that are going to be added to the file-node.
 * @param fileNode The file-node that are being appended to.
 * @returns The variable name of the method.
 */
function generateMethod(method:Method, fileNode: CompositeGeneratorNode): string {
    const methodName = method.name || `m${NONENAMEGIVEN}${uid()}`
    const nvars = method.signature.inputVariables.length + method.signature.outputVariables.length
    const ins = method.signature.inputVariables.map((variableRef: VariableReference) => variableIndex.get(variableRef.ref.ref?.name!))
    const outs = method.signature.outputVariables.map((variableRef: VariableReference) => variableIndex.get(variableRef.ref.ref?.name!))
    const promiseMask = ["MaskNone"]
    const code = "Donno what to do her yet"

    fileNode.append(`let ${methodName} = new Method(${nvars}, [${ins}], [${outs}], [${promiseMask}], "${code}")`, NL)
    return methodName
}

/**
 * Append the constraints to the file-node.
 * @param component The component holding the constraints.
 * @param fileNode The file-node that are being appended to.
 * @param specNames The variable names of the constraint specifications in the component.
 */
function generateConstraints(component:Component, fileNode: CompositeGeneratorNode, specNames: string[]) {
    component.constraints.forEach((constraint: Constraint, idx:number) => {
        fileNode.append(`// emplace a constraint built from the constraint spec`, NL)
        const constraintName = specNames[idx].substring(0, specNames[idx].length-SpecPrefix.length)
        const vrefs = constraint.methods[0].signature.inputVariables.map(v => v.ref.ref?.name).concat(constraint.methods[0].signature.outputVariables.map(v => v.ref.ref?.name))
        fileNode.append(`let ${constraintName} = ${component.name}.emplaceConstraint("${constraintName}", ${specNames[idx]}, [${vrefs}])`, NL, NL)
    })
}