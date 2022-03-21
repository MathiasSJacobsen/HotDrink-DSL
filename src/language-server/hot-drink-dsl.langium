grammar HotDrinkDsl

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

entry Model:
    (imports+=Import)*
    (components+=Component)*
    ;

Import:
    //"import" "{"  funcs+=ImportedFunction ("," funcs+=ImportedFunction)* "}" "from" file=STRING;
    "import" "{" imports+=ImportedFunction ("," imports+=ImportedFunction )* "}" "from" file=STRING;

ImportedFunction:
    function=FuncName ("as" altName=FuncName)?
    ;
FuncName:
    name=ID;

Component: 
    "component" name=ID "{"
        (variables += Vars | 
        constraints += Constraint)*
    "}"
;

Vars:
	"var" vars+=Variable
	("," vars+=Variable)* ";"
;

Variable:
    name=ID (":" type?=VarType)? ("=" initValue=ValueExpr)?;

VarType returns string:
    'string'
    |
    'number'
    |
    'boolean'
    ;

ValueExpr:
    StringValueExpr | NumberValueExpr | BooleanValueExpr;

StringValueExpr: val=STRING;

NumberValueExpr: digit=INT ("."decimal=INT)?;

BooleanValueExpr: val=("true"|"false");

Constraint:
    "constraint" (name=ID)?"{" 
        methods+=Method+
    "}"
;

FunctionCall:
    funcRef=[FuncName] "(" (args+=[Variable] ("," args+=[Variable])* )?  ")"
;

Method:
    (name=ID)? signature=Signature "=>" 
        body=Body
    ";"
;

Body:
    value=FunctionCall | value=Expr | "[" values+=Body ("," values+=Body)+ "]";

VariableReference:
    ref=[Variable] (hasMark?="!")?;

Signature: 
    "(" inputVariables+=VariableReference ("," inputVariables+=VariableReference)* "->" outputVariables+=VariableReference ("," outputVariables+=VariableReference)* ")";


Atomic infers Expr:
    {infer IntConst} value=INT |
    {infer StringConst} value=STRING |
    {infer BoolConst} value=("true" | "false") |
    {infer VarRef} value=[Variable]
;

Primary infers Expr:
    {infer Parenthesis} "("expression=Expr")" |
    {infer Not} "!" expression=Primary | 
    Atomic
;

MulOrDiv infers Expr:
    Primary ({infer MulOrDiv.left=current} op=("*"|"/") right=Primary)*;

PlusOrMinus infers Expr:
    MulOrDiv ({infer PlusOrMinus.left=current} op=("+"|"-") right=MulOrDiv)*;

Comparison infers Expr:
    PlusOrMinus ({infer Comparison.left=current} op=(">="|"<="|">"|"<") right=PlusOrMinus)*;

Equality infers Expr: 
    Comparison ({infer Equality.left=current} op=("=="|"!=" |"==="| "!==") right=Comparison)*;

And infers Expr:
    Equality ({infer And.left=current} op=("&&") right=Equality)*;

Or infers Expr:
    And ({infer Or.left=current} op=("||") right=And)*;

Expr: Or;