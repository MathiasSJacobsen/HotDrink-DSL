import {
    ValidationAcceptor,
    ValidationCheck,
    ValidationRegistry,
} from "langium";
import {
    Arguments,
    Component,
    Constraint,
    HotDrinkDslAstType,
    Import,
    Method,
    Model,
    Var,
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
            Var: validator.checkVarStartsWithLowercase,
            Arguments: validator.checkArgumentOnlyReferenceToVarOnce,
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
    checkVarStartsWithLowercase(_var: Var, accept: ValidationAcceptor): void {
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

    checkArgumentOnlyReferenceToVarOnce(argument: Arguments, accept: ValidationAcceptor): void {
        if (argument.variables) {
            const s = new Set(argument.variables.map(e => e.ref.ref?.name));
            if (s.size !== argument.variables.length) {
                accept("error", "Can not use the same variable more then once in an argument.", { node: argument, property: "variables" }) // TODO: Should be shown on the last variable of the
            }
            const s1 = new Set(argument.final.map(e => e.ref?.name));
            if (s1.size !== argument.final.length) {
                accept("error", "Can no use the same variable more then once in an argument.", { node: argument, property: "final" }) // TODO: Should be shown on the last variable of the 
            }
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
            const unique = new Set(constraint.methods.map((e) => e.name));
            if (unique.size !== constraint.methods.length) {
                accept("warning", "Constraint methods should have unique names.", {
                    node: constraint,
                    property: "methods",
                });
            }
        }
    }

    checkConstraintMethodsUsesTheSameVars(
        constraint: Constraint,
        accept: ValidationAcceptor
    ): void {
        if (constraint.methods) {
            const unique = constraint.methods[0].args.variables.map((e) => e.ref.ref?.name).concat(constraint.methods[0].args.final.map((e) => e.ref?.name)).sort();
            constraint.methods.forEach(method => {
                const unique2 = method.args.variables.map((e) => e.ref.ref?.name).concat(method.args.final.map((e) => e.ref?.name)).sort();
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
            }
        }
    }

    checkComponentVarsHaveUniqueName(
        component: Component,
        accept: ValidationAcceptor
    ): void {
        if (component.vars) {
            const unique = new Set(component.vars.map((e) => e.name));
            if (unique.size !== component.vars.length) {
                //TODO: Something wrong with the syntax highlighting, goes over the hole component
                accept("error", "Component vars should have unique names.", {
                    node: component,
                    property: "vars",
                });
            }
        }
    }

    checkComponentForUnusedVariables(
        component: Component,
        accept: ValidationAcceptor,
    ): void {
        if (component.vars) {
            const usedVariables = this.findAllInUseVariables(component)
            if (usedVariables.size !== component.vars.length){
                component.vars.forEach(_var => {
                    if (!usedVariables.has(_var.name)){
                        accept("warning",`Variable not in use.`, {
                            node: _var
                        })

                    }
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
                const vars = method.args.variables.map(varRef => varRef.ref.ref!.name).concat(...method.args.final.map(varRef => varRef.ref!.name))
                if (vars){
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
            listOfImports.forEach((_import: Import) => {
                const uni = new Set(_import.funcs.map((name: string) => name));
                if (uni.size !== _import.funcs.length) {
                    accept("warning", "Should not import the same function more then once.", {
                        node: model,
                        property: "imports",
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
