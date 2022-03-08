import {
    ValidationAcceptor,
    ValidationCheck,
    ValidationRegistry,
} from "langium";
import {

    Component,
    Constraint,
    HotDrinkDslAstType, Import, Method, Model, Signature, Variable,

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
            Variable: validator.checkVarStartsWithLowercase,
            Signature: validator.checkArgumentOnlyReferenceToVarOnce,
            Method: validator.checkMethodStartsWithLowercase,
            Constraint: [
                validator.checkConstraintStartWithLowercase,
                validator.checkConstraintMethodsHaveUniqueName,
                validator.checkConstraintMethodsUsesTheSameVars,
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
                });
            }
        }
    }

    checkArgumentOnlyReferenceToVarOnce(argument: Signature, accept: ValidationAcceptor): void {
        if (argument.inputVariables) {
            const s = new Set(argument.inputVariables.map(e => e.ref.ref?.name));
            if (s.size !== argument.inputVariables.length) {
                accept("error", "Can not use the same variable more then once in a statement.", { node: argument, property: "inputVariables" }) // TODO: Should be shown on the last variable of the
            }
            const s1 = new Set(argument.outputVariables.map(e => e.ref?.ref?.name));
            if (s1.size !== argument.outputVariables.length) {
                accept("error", "Can not use the same variable more then once in a statement.", { node: argument, property: "outputVariables" }) // TODO: Should be shown on the last variable of the 
            }
        }
    }
    // TODO: BUG DOSNT WORK
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
            const unique = new Set(constraint.methods.map((e) => e.name));
            if (unique.size !== constraint.methods.length) {
                accept("warning", "Constraint methods should have unique names.", {
                    node: constraint,
                    property: "methods",
                }); // TODO: Trenger å få denne plassert riktig.
            }
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
            const unique = new Set(component.constraints.map((e) => e.name));
            if (unique.size !== component.constraints.length) {
                //TODO: Something wrong with the syntax highlighting, goes over the hole component
                accept("warning", "Component constraints should have unique names.", {
                    node: component,
                    property: "constraints",
                });
            } // fikse hvor den vises
        }
    }

    checkComponentVarsHaveUniqueName(
        component: Component,
        accept: ValidationAcceptor
    ): void {
        if (component.variables) {
            const unique = new Set(component.variables.flatMap((e) => e.vars).map(e => e.name));
            if (unique.size !== component.variables.map(e => e.vars).reduce((sum, current) => sum + current.length, 0)) {
                //TODO: Something wrong with the syntax highlighting, goes over the hole component
                accept("error", "Component vars should have unique names.", {
                    node: component,
                    property: "variables",
                });
            }
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
                                node: _var
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
            listOfImports.forEach((importStatement: Import) => {

                const listOfImportedFunctions = importStatement.funcs.map((name) => name.name)
                const unique = new Set(listOfImportedFunctions);

                if (unique.size !== importStatement.funcs.length) {
                    accept("warning", "Should not import the same function more then once.", {
                        node: importStatement
                    })
                }
            })
        }
    }

    checkModelComponentNameIsUnique(
        model: Model,
        accept: ValidationAcceptor
    ): void {
        if (model.component) {
            const uniqueNames = new Set(model.component.map((component: Component) => component.name));
            if (uniqueNames.size !== model.component.length) {
                accept("warning", "Component names should be unique", {
                    node: model,
                    property: "component",
                })
            }
        }
    }
}
