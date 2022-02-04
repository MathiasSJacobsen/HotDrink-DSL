import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { Arguments, HotDrinkDslAstType, Method, Var } from './generated/ast';
import { HotDrinkDslServices } from './hot-drink-dsl-module';

/**
 * Map AST node types to validation checks.
 */
type HotDrinkDslChecks = { [type in HotDrinkDslAstType]?: ValidationCheck | ValidationCheck[] }

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
            Constraint: validator.checkConstraintStartWithLowercase,
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
    
      checkArgumentOnlyReferenceToVarOnce(argument:Arguments, accept: ValidationAcceptor): void {
          if(argument.variables){
              const s = new Set(argument.variables.map(e => e.ref.ref?.name));
              if (s.size !== argument.variables.length){
                  accept("error", "Can not use the same variable more then once in an argument.", {node: argument, property: "variables"}) // TODO: Should be shown on the last variable of the
              }
              const s1 = new Set(argument.final.map(e => e.ref?.name));
              if (s1.size !== argument.final.length) {
                  accept("error", "Can no use the same variable more then once in an argument.", {node: argument, property: "final"}) // TODO: Should be shown on the last variable of the 
              }
          }
      }
    
        checkMethodStartsWithLowercase(method: Method, accept: ValidationAcceptor): void {
            if (method.name){
                const firstChar = method.name.substring(0,1);
                if (firstChar.toLowerCase() !== firstChar) {
                    accept("warning", "Methods should start with lowercase.", {node: method, property: "name"})
                }
            }
        }

        checkConstraintStartWithLowercase(constraint: Constraint, accept: ValidationAcceptor): void {
            if (constraint.name) {
                const firstChar = constraint.name.substring(0,1);
                if (firstChar.toLowerCase() !== firstChar){
                    accept("warning", "Constraint should start with lowercase.", {node: constraint, property: "name"})
                }
            }
        }
}
