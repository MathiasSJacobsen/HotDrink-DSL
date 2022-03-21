/******************************************************************************
 * This file was generated by langium-cli 0.3.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { AstNode, AstReflection, Reference, isAstNode } from 'langium';

export type Expr = And | BoolConst | Comparison | Equality | IntConst | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus | StringConst | VarRef;

export const Expr = 'Expr';

export function isExpr(item: unknown): item is Expr {
    return reflection.isInstance(item, Expr);
}

export type ValueExpr = BooleanValueExpr | NumberValueExpr | StringValueExpr;

export const ValueExpr = 'ValueExpr';

export function isValueExpr(item: unknown): item is ValueExpr {
    return reflection.isInstance(item, ValueExpr);
}

export type VarType = 'boolean' | 'number' | 'string';

export interface And extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    left: Expr
    op: '&&'
    right: Expr
}

export const And = 'And';

export function isAnd(item: unknown): item is And {
    return reflection.isInstance(item, And);
}

export interface Body extends AstNode {
    readonly $container: Body | Method;
    value: Expr | FunctionCall
    values: Array<Body>
}

export const Body = 'Body';

export function isBody(item: unknown): item is Body {
    return reflection.isInstance(item, Body);
}

export interface BoolConst extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    value: 'false' | 'true'
}

export const BoolConst = 'BoolConst';

export function isBoolConst(item: unknown): item is BoolConst {
    return reflection.isInstance(item, BoolConst);
}

export interface BooleanValueExpr extends AstNode {
    readonly $container: Variable;
    val: 'false' | 'true'
}

export const BooleanValueExpr = 'BooleanValueExpr';

export function isBooleanValueExpr(item: unknown): item is BooleanValueExpr {
    return reflection.isInstance(item, BooleanValueExpr);
}

export interface Comparison extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    left: Expr
    op: '<' | '<=' | '>' | '>='
    right: Expr
}

export const Comparison = 'Comparison';

export function isComparison(item: unknown): item is Comparison {
    return reflection.isInstance(item, Comparison);
}

export interface Component extends AstNode {
    readonly $container: Model;
    constraints: Array<Constraint>
    name: string
    variables: Array<Vars>
}

export const Component = 'Component';

export function isComponent(item: unknown): item is Component {
    return reflection.isInstance(item, Component);
}

export interface Constraint extends AstNode {
    readonly $container: Component;
    methods: Array<Method>
    name: string
}

export const Constraint = 'Constraint';

export function isConstraint(item: unknown): item is Constraint {
    return reflection.isInstance(item, Constraint);
}

export interface Equality extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    left: Expr
    op: '!=' | '!==' | '==' | '==='
    right: Expr
}

export const Equality = 'Equality';

export function isEquality(item: unknown): item is Equality {
    return reflection.isInstance(item, Equality);
}

export interface FuncName extends AstNode {
    readonly $container: ImportedFunction;
    name: string
}

export const FuncName = 'FuncName';

export function isFuncName(item: unknown): item is FuncName {
    return reflection.isInstance(item, FuncName);
}

export interface FunctionCall extends AstNode {
    readonly $container: Body;
    args: Array<Reference<Variable>>
    funcRef: Reference<FuncName>
}

export const FunctionCall = 'FunctionCall';

export function isFunctionCall(item: unknown): item is FunctionCall {
    return reflection.isInstance(item, FunctionCall);
}

export interface Import extends AstNode {
    readonly $container: Model;
    file: string
    imports: Array<ImportedFunction>
}

export const Import = 'Import';

export function isImport(item: unknown): item is Import {
    return reflection.isInstance(item, Import);
}

export interface ImportedFunction extends AstNode {
    readonly $container: Import;
    altName: FuncName
    function: FuncName
}

export const ImportedFunction = 'ImportedFunction';

export function isImportedFunction(item: unknown): item is ImportedFunction {
    return reflection.isInstance(item, ImportedFunction);
}

export interface IntConst extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    value: number
}

export const IntConst = 'IntConst';

export function isIntConst(item: unknown): item is IntConst {
    return reflection.isInstance(item, IntConst);
}

export interface Method extends AstNode {
    readonly $container: Constraint;
    body: Body
    name: string
    signature: Signature
}

export const Method = 'Method';

export function isMethod(item: unknown): item is Method {
    return reflection.isInstance(item, Method);
}

export interface Model extends AstNode {
    components: Array<Component>
    imports: Array<Import>
}

export const Model = 'Model';

export function isModel(item: unknown): item is Model {
    return reflection.isInstance(item, Model);
}

export interface MulOrDiv extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    left: Expr
    op: '*' | '/'
    right: Expr
}

export const MulOrDiv = 'MulOrDiv';

export function isMulOrDiv(item: unknown): item is MulOrDiv {
    return reflection.isInstance(item, MulOrDiv);
}

export interface Not extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    expression: Expr
}

export const Not = 'Not';

export function isNot(item: unknown): item is Not {
    return reflection.isInstance(item, Not);
}

export interface NumberValueExpr extends AstNode {
    readonly $container: Variable;
    decimal: number
    digit: number
}

export const NumberValueExpr = 'NumberValueExpr';

export function isNumberValueExpr(item: unknown): item is NumberValueExpr {
    return reflection.isInstance(item, NumberValueExpr);
}

export interface Or extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    left: Expr
    op: '||'
    right: Expr
}

export const Or = 'Or';

export function isOr(item: unknown): item is Or {
    return reflection.isInstance(item, Or);
}

export interface Parenthesis extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    expression: Expr
}

export const Parenthesis = 'Parenthesis';

export function isParenthesis(item: unknown): item is Parenthesis {
    return reflection.isInstance(item, Parenthesis);
}

export interface PlusOrMinus extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    left: Expr
    op: '+' | '-'
    right: Expr
}

export const PlusOrMinus = 'PlusOrMinus';

export function isPlusOrMinus(item: unknown): item is PlusOrMinus {
    return reflection.isInstance(item, PlusOrMinus);
}

export interface Signature extends AstNode {
    readonly $container: Method;
    inputVariables: Array<VariableReference>
    outputVariables: Array<VariableReference>
}

export const Signature = 'Signature';

export function isSignature(item: unknown): item is Signature {
    return reflection.isInstance(item, Signature);
}

export interface StringConst extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    value: string
}

export const StringConst = 'StringConst';

export function isStringConst(item: unknown): item is StringConst {
    return reflection.isInstance(item, StringConst);
}

export interface StringValueExpr extends AstNode {
    readonly $container: Variable;
    val: string
}

export const StringValueExpr = 'StringValueExpr';

export function isStringValueExpr(item: unknown): item is StringValueExpr {
    return reflection.isInstance(item, StringValueExpr);
}

export interface Variable extends AstNode {
    readonly $container: Vars;
    initValue: ValueExpr
    name: string
    type: boolean
}

export const Variable = 'Variable';

export function isVariable(item: unknown): item is Variable {
    return reflection.isInstance(item, Variable);
}

export interface VariableReference extends AstNode {
    readonly $container: Signature;
    hasMark: boolean
    ref: Reference<Variable>
}

export const VariableReference = 'VariableReference';

export function isVariableReference(item: unknown): item is VariableReference {
    return reflection.isInstance(item, VariableReference);
}

export interface VarRef extends AstNode {
    readonly $container: And | Body | Comparison | Equality | MulOrDiv | Not | Or | Parenthesis | PlusOrMinus;
    value: Reference<Variable>
}

export const VarRef = 'VarRef';

export function isVarRef(item: unknown): item is VarRef {
    return reflection.isInstance(item, VarRef);
}

export interface Vars extends AstNode {
    readonly $container: Component;
    vars: Array<Variable>
}

export const Vars = 'Vars';

export function isVars(item: unknown): item is Vars {
    return reflection.isInstance(item, Vars);
}

export type HotDrinkDslAstType = 'And' | 'Body' | 'BoolConst' | 'BooleanValueExpr' | 'Comparison' | 'Component' | 'Constraint' | 'Equality' | 'Expr' | 'FuncName' | 'FunctionCall' | 'Import' | 'ImportedFunction' | 'IntConst' | 'Method' | 'Model' | 'MulOrDiv' | 'Not' | 'NumberValueExpr' | 'Or' | 'Parenthesis' | 'PlusOrMinus' | 'Signature' | 'StringConst' | 'StringValueExpr' | 'ValueExpr' | 'VarRef' | 'Variable' | 'VariableReference' | 'Vars';

export type HotDrinkDslAstReference = 'FunctionCall:args' | 'FunctionCall:funcRef' | 'VariableReference:ref' | 'VarRef:value';

export class HotDrinkDslAstReflection implements AstReflection {

    getAllTypes(): string[] {
        return ['And', 'Body', 'BoolConst', 'BooleanValueExpr', 'Comparison', 'Component', 'Constraint', 'Equality', 'Expr', 'FuncName', 'FunctionCall', 'Import', 'ImportedFunction', 'IntConst', 'Method', 'Model', 'MulOrDiv', 'Not', 'NumberValueExpr', 'Or', 'Parenthesis', 'PlusOrMinus', 'Signature', 'StringConst', 'StringValueExpr', 'ValueExpr', 'VarRef', 'Variable', 'VariableReference', 'Vars'];
    }

    isInstance(node: unknown, type: string): boolean {
        return isAstNode(node) && this.isSubtype(node.$type, type);
    }

    isSubtype(subtype: string, supertype: string): boolean {
        if (subtype === supertype) {
            return true;
        }
        switch (subtype) {
            case And:
            case BoolConst:
            case Comparison:
            case Equality:
            case IntConst:
            case MulOrDiv:
            case Not:
            case Or:
            case Parenthesis:
            case PlusOrMinus:
            case StringConst:
            case VarRef: {
                return this.isSubtype(Expr, supertype);
            }
            case BooleanValueExpr:
            case NumberValueExpr:
            case StringValueExpr: {
                return this.isSubtype(ValueExpr, supertype);
            }
            default: {
                return false;
            }
        }
    }

    getReferenceType(referenceId: HotDrinkDslAstReference): string {
        switch (referenceId) {
            case 'FunctionCall:args': {
                return Variable;
            }
            case 'FunctionCall:funcRef': {
                return FuncName;
            }
            case 'VariableReference:ref': {
                return Variable;
            }
            case 'VarRef:value': {
                return Variable;
            }
            default: {
                throw new Error(`${referenceId} is not a valid reference id.`);
            }
        }
    }
}

export const reflection = new HotDrinkDslAstReflection();
