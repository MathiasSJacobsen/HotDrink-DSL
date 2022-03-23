import fs from "fs";
import { CompositeGeneratorNode, NL, processGeneratorNode, Reference } from "langium";
import {
    Body,
    Component,
    Constraint,
    FunctionCall,
    Import,
    ImportedFunction,
    Method,
    Model,
    Variable,
    VariableReference,
    Vars,
    Expr,
    isOr,
    isParenthesis,
    isNot,
    isVarRef,
    isIntConst,
    isStringConst,
    isBoolConst,
    isMulOrDiv,
    isPlusOrMinus,
    isComparison,
    isEquality,
    isAnd,
    isNumberValueExpr,
    isStringValueExpr,
    isBooleanValueExpr,
    isExpr,
    BooleanValueExpr,
} from "../language-server/generated/ast";
import { extractDestinationAndName } from "./cli-util";
import path from "path";
import { NAMETAKEN, NONENAMEGIVEN, SpecPrefix, uid, usedVariableNames, variableIndex } from "../utils";


// let to const og export components
// lese på source map


export function generateJavaScript(
    model: Model,
    filePath: string,
    destination: string | undefined
): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = new CompositeGeneratorNode();
    fileNode.append('"use strict";', NL, NL);

    generateHotDrinkImports(fileNode)
    generateImports(model.imports, fileNode);
    fileNode.append(NL);

    generateComponent(model.components, fileNode)

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
    return generatedFilePath;
}

function generateHotDrinkImports(fileNode: CompositeGeneratorNode) {
    fileNode.append("import { Component, Method, ConstraintSpec } from 'hotdrink';", NL, NL);
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

        fileNode.append(`export const ${compName} = new Component("${compName}")`, NL)

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
            fileNode.append(`const ${variable.name} = ${component.name}.emplaceVariable("${variable.name}"`)
            variableIndex.set(variable.name, arrayIdx++)

            if(variable.initValue) {
                const initValue = variable.initValue
                if(isNumberValueExpr(initValue)) {
                    fileNode.append(`, ${initValue.digit}`)
                    if(initValue.decimal){
                        fileNode.append(`.${initValue.decimal}`)
                    }
                } else if (isStringValueExpr(initValue)) {
                    fileNode.append(`, ${initValue.val}`)
                } else if (isBooleanValueExpr(initValue)) {
                    fileNode.append(`, ${(initValue as BooleanValueExpr).val}`)
                } else {
                    console.error(initValue);
                    throw new Error("Cant handle initValue type");
                }
            } 
            fileNode.append(')', NL)
        })
    })
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
        fileNode.append(`const ${constraintName+SpecPrefix} = new ConstraintSpec([${methodNames.map((name:string) => name)}])`, NL)
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
    const inputVariables = method.signature.inputVariables.map(v => v.ref.ref?.name)
    const code = makeCodeForMethod(method.body)

    fileNode.append(`const ${methodName} = new Method(${nvars}, [${ins}], [${outs}], [${promiseMask}], (${inputVariables}) => ${code})`, NL)
    return methodName
}

function makeCodeForMethod(body: Body):string {
    if (body.value){
        if(body.value.$type === "FunctionCall") {
            const functionCall = body.value as FunctionCall
            const args = functionCall.args.map((refVariable: Reference<Variable>) => refVariable.ref?.name)
            const functionName = functionCall.funcRef.$refText!
            return `${functionName}(${args})`
        } else if ( isExpr(body.value)) {
            return  generateExpr(body.value)
        } else {
            console.error(body);
            throw new Error("Cant read ");
        }
    } else if (body.values) {
        return `[${body.values.map(makeCodeForMethod)}]`
    } else {
        console.error(body);
        throw new Error("Cant read body");
    }
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
        fileNode.append(`const ${constraintName} = ${component.name}.emplaceConstraint("${constraintName}", ${specNames[idx]}, [${vrefs}])`, NL, NL)
    })
}

function generateExpr(expr: Expr) : string {
    if (isIntConst(expr)) {
        return expr.value.toString()
    } else if (isStringConst(expr)){
        return `"${expr.value}"`
    } else if (isBoolConst(expr)) {
        return expr.value.toString()
    } else if (isVarRef(expr)) {
        return expr.value.ref?.name.toString()!
    } else if (isParenthesis(expr)) {
        return `(${generateExpr(expr.expression)})`
    } else if (isNot(expr)) {
        return `!${generateExpr(expr.expression)}`
    } else if (isMulOrDiv(expr)) {
        return generateExpr(expr.left)+ " " + expr.op + " " + generateExpr(expr.right)
    } else if (isPlusOrMinus(expr)) {
        return generateExpr(expr.left) + " " + expr.op + " " + generateExpr(expr.right)
    } else if (isComparison(expr)) {
        return generateExpr(expr.left) + " " + expr.op + " " + generateExpr(expr.right)
    } else if (isEquality(expr)) {
        return generateExpr(expr.left) + " " + expr.op + " " + generateExpr(expr.right)
    } else if (isAnd(expr)) {
        return generateExpr(expr.left) + " " + expr.op + " " + generateExpr(expr.right)
    } else if (isOr(expr)) {
        return generateExpr(expr.left) + " " + expr.op + " " + generateExpr(expr.right)
    } else {
        console.error(expr);
        throw new Error("None known expr type");
    }
}