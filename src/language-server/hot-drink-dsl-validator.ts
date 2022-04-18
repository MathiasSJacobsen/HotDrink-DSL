import {
    ValidationAcceptor,
    ValidationCheck,
    ValidationRegistry,
} from "langium";

import {

    Component,
    Constraint,
    HotDrinkDslAstType, ImportedFunction, Method, Model, Signature, Variable, VariableReference, Vars,

} from "./generated/ast";
import { HotDrinkDslServices } from "./hot-drink-dsl-module";

/**
 * Map AST node types to validation checks.
 */
type HotDrinkDslChecks = {
    [type in HotDrinkDslAstType]?: ValidationCheck | ValidationCheck[];
};

/**
 * Registry for validation checks.
 */
export class HotDrinkDslValidationRegistry extends ValidationRegistry {
    constructor(services: HotDrinkDslServices) {
        super(services);
        const validator = services.validation.HotDrinkDslValidator;
        const checks: HotDrinkDslChecks = {
            Vars: [
                validator.hintToInitializeVariablesToZero
            ],
            Variable: [
                validator.checkVarStartsWithLowercase
            ],
            Signature: [
                validator.checkSignatureOnlyReferenceToVarOnce,
                validator.checkSignatureForExclamationVariables,
            ],
            Method: validator.checkMethodStartsWithLowercase,
            Constraint: [
                validator.checkConstraintStartWithLowercase,
                validator.checkConstraintMethodsHaveUniqueName,
                validator.checkConstraintMethodsUsesTheSameVars,
                validator.hintToMakePermutations,
            ],
            Component: [
                validator.checkComponentConstraintsHaveUniqueName,
                validator.checkComponentVarsHaveUniqueName,
                validator.checkComponentForUnusedVariables,
            ],
            Model: [
                validator.checkModelImpFunctionIsntImportedMoreThenOnceInOnceStatement,
                validator.checkModelComponentNameIsUnique,
            ],
        };
        this.register(checks, validator);
    }
}

export namespace IssueCodes {
    export const VarNameUpperCase = 'var-name-uppercase';
    export const Permutations = 'permutations';
    export const InitiateVariablesToZero = 'initiate-variables-to-zero';
}

/**
 * Implementation of custom validations.
 */
export class HotDrinkDslValidator {
    checkVarStartsWithLowercase(_var: Variable, accept: ValidationAcceptor): void {
        if (_var.name) {
            const firstChar = _var.name.substring(0, 1);
            if (firstChar.toLowerCase() !== firstChar) {
                accept("warning", "Var name should start with lowercase.", {
                    node: _var,
                    property: "name",
                    code: IssueCodes.VarNameUpperCase,
                });
            }
        }
    }

    checkSignatureOnlyReferenceToVarOnce(signature: Signature, accept: ValidationAcceptor): void {
        if (signature.inputVariables) {
            const s = new Set(signature.inputVariables.map(e => e.ref.ref?.name));
            if (s.size !== signature.inputVariables.length) {
                accept("error", "Can not use the same variable more then once in a signature.", { node: signature, property: "inputVariables" }) // TODO: Should be shown on the last variable of the
            }
            const s1 = new Set(signature.outputVariables.map(e => e.ref?.ref?.name));
            if (s1.size !== signature.outputVariables.length) {
                accept("error", "Can not use the same variable more then once in a signature.", { node: signature, property: "outputVariables" }) // TODO: Should be shown on the last variable of the 
            }
        }
    }

    checkSignatureForExclamationVariables(signature: Signature, accept: ValidationAcceptor): void {
        if (signature.inputVariables) {
            const inputVariablesRef = signature.inputVariables
            inputVariablesRef.forEach((element: VariableReference) => {
                if (element.hasMark) {
                    accept("info", "Experimental feature, may not work", { node: element, property: "hasMark" })
                }
            })
        }
    }

    checkMethodStartsWithLowercase(
        method: Method,
        accept: ValidationAcceptor
    ): void {
        if (method.name) {
            const firstChar = method.name.substring(0, 1);
            if (firstChar.toLowerCase() !== firstChar) {
                accept("warning", "Methods should start with lowercase.", {
                    node: method,
                    property: "name",
                });
            }
        }
    }

    checkConstraintStartWithLowercase(
        constraint: Constraint,
        accept: ValidationAcceptor
    ): void {
        if (constraint.name) {
            const firstChar = constraint.name.substring(0, 1);
            if (firstChar.toLowerCase() !== firstChar) {
                accept("warning", "Constraint should start with lowercase.", {
                    node: constraint,
                    property: "name",
                });
            }
        }
    }

    checkConstraintMethodsHaveUniqueName(
        constraint: Constraint,
        accept: ValidationAcceptor
    ): void {
        if (constraint.methods) {
            const unique = new Set(constraint.methods.map((e: Method) => e.name).filter((e: string) => e !== undefined)); // filter undefined in case where method do not have name.
            constraint.methods.forEach((method: Method) => {
                if (unique.has(method.name)) {
                    unique.delete(method.name)
                } else if (!unique.has(method.name) && method.name !== undefined) {
                    accept("warning", "Constraint methods should have unique names.", { node: method, property: "name" })
                }
            })
        }
    }

    checkConstraintMethodsUsesTheSameVars(
        constraint: Constraint,
        accept: ValidationAcceptor
    ): void {
        if (constraint.methods) {
            const unique = constraint.methods[0].signature.inputVariables.map((e) => e.ref.ref?.name).concat(constraint.methods[0].signature.outputVariables.map((e) => e.ref?.ref?.name)).sort();
            constraint.methods.forEach(method => {
                const unique2 = method.signature.inputVariables.map((e) => e.ref.ref?.name).concat(method.signature.outputVariables.map((e) => e.ref?.ref?.name)).sort();
                if (unique.length !== unique2.length || unique.join(",") !== unique2.join(",")) {
                    accept("error", `All methods inside a given constraint needs to reference all the same variables.`, {
                        node: constraint,
                        property: "methods",
                    });
                }
            })
        }
    }

    checkComponentConstraintsHaveUniqueName(
        component: Component,
        accept: ValidationAcceptor
    ): void {
        if (component.constraints) {
            const unique = new Set(component.constraints.map((e: Constraint) => e.name).filter((e: string) => e !== undefined));
            component.constraints.forEach((constraint: Constraint) => {
                if (unique.has(constraint.name)) {
                    unique.delete(constraint.name)
                } else if (!unique.has(constraint.name) && constraint.name !== undefined) {
                    accept("warning", "Component constraints should have unique names.", {
                        node: constraint,
                        property: "name",
                    });
                }
            })
        }
    }

    checkComponentVarsHaveUniqueName(
        component: Component,
        accept: ValidationAcceptor
    ): void {
        if (component.variables) {
            const unique = new Set(component.variables.flatMap((e) => e.vars).map(e => e.name));
            component.variables.forEach((_vars: Vars) => {
                _vars.vars.forEach((value: Variable) => {
                    if (unique.has(value.name)) {
                        unique.delete(value.name)
                    } else {
                        accept("error", "Component vars should have unique names.", { node: value, property: "name" })
                    }
                })
            })
        }
    }

    checkComponentForUnusedVariables(
        component: Component,
        accept: ValidationAcceptor,
    ): void {
        if (component.variables) {
            const usedVariables = this.findAllInUseVariables(component)
            if (usedVariables.size !== component.variables.map(e => e.vars).reduce((sum, current) => sum + current.length, 0)) {
                component.variables.forEach(_var => {
                    _var.vars.map(_v => {
                        if (!usedVariables.has(_v.name)) {
                            accept("warning", `Variable not in use.`, {
                                node: _v,
                                property: "name"
                            })
                        }
                    })

                })
            }


        }
    }
    private findAllInUseVariables(component: Component): Set<string> {
        let allVariablesInUse = new Set<string>()
        const constraints = component.constraints
        constraints.forEach(constraint => {
            const methods = constraint.methods
            methods.forEach(method => {
                const vars = method.signature.inputVariables.map(varRef => varRef.ref.ref!.name).concat(...method.signature.outputVariables.map(varRef => varRef.ref!.ref!.name))
                if (vars) {
                    allVariablesInUse = new Set([...allVariablesInUse, ...vars])
                }
            });
        });
        return allVariablesInUse
    }

    checkModelImpFunctionIsntImportedMoreThenOnceInOnceStatement(
        model: Model,
        accept: ValidationAcceptor
    ): void {
        if (model.imports) {
            const listOfImports = model.imports;
            listOfImports.forEach(importStatement => {
                const listOfImportedFunctions = importStatement.imports.map((importedFunction:ImportedFunction) => {
                    if (importedFunction.altName){
                        return importedFunction.altName.name
                    } else return importedFunction.function.name
                })
                const unique = new Set(listOfImportedFunctions);
                if (unique.size !== importStatement.imports.length) {
                    accept("error", "Should not import the same function more then once.", {
                        node: importStatement
                    })
                }
            });
        }
    }

    checkModelComponentNameIsUnique(
        model: Model,
        accept: ValidationAcceptor
    ): void {
        if (model.components) {
            const uniqueNames = new Set(model.components.map((component: Component) => component.name).filter((e: string) => e !== undefined));

            model.components.forEach((comp: Component) => {
                if (uniqueNames.has(comp.name)) {
                    uniqueNames.delete(comp.name)
                } else if (!uniqueNames.has(comp.name) && comp.name !== undefined) {
                    accept("warning", "Component names should be unique", {
                        node: comp,
                        property: "name",
                    })
                }
            })
        }
        
    }
    hintToMakePermutations(
        constraint: Constraint,
        accept: ValidationAcceptor
    ): void {
        if (constraint.methods.length === 1) {
            accept("hint", "Able to make permutations", {
                node: constraint.methods[0], 
                property: "signature", 
                code: IssueCodes.Permutations,
                data: constraint.$containerIndex?.toString()!+ "." + constraint.$container.$containerIndex?.toString(), // trengs for quick fix, fant ingen bedre måte å gjøre det
            })
        }
    }

    hintToInitializeVariablesToZero(
        vars: Vars,
        accept: ValidationAcceptor
    ): void {
        if (vars.vars.every(varRef => varRef.initValue === undefined)) {
            accept("hint", "Able to initialize all variables to zero", {
                node: vars,
                property: "vars",
                code: IssueCodes.InitiateVariablesToZero,
                data: vars.$container.$containerIndex?.toString() + "." + vars.$containerIndex?.toString()  // trengs for quick fix, fant ingen bedre måte å gjøre det
            })
        }
    }
}
