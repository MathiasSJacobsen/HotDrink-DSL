grammar HotDrinkDsl
hidden(WS, SL_COMMENT, ML_COMMENT)

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;

Model:
    imports+=Import*
    component+=Component*
    ;

Import:
    "import" funcs+=ID ("," funcs+=ID)* "from" file=STRING;

Component: 
    "component" name=ID "{"
        (vars += Variable | 
        constraints += Constraint)*
    "}"
;

Variable:
    Var;

Var:
    "var" name=ID ";";

Constraint:
    "constraint" (name=ID)? "{" 
        methods+=Method+
    "}"
;

ImpFunction:
    name=ID "(" (args+=[Variable] ("," args+=[Variable])* )?  ")"
;

Method:
    name=ID args=Arguments "=>" "{"
        Body
    "}"
;

Body:
    value=ImpFunction | value=Expr;

VariableReference:
    ref=[Variable] (hasMark?="!")?;

Arguments: 
    "(" ref+=VariableReference ("," ref+=VariableReference)* "->" final+=[Variable] ("," final+=[Variable])* ")";

Atomic:
    {IntConst} value=INT |
    {StringConst} value=STRING |
    {BoolConst} value=("true" | "false") |
    {VarRef} value=[Variable]
;

Primary returns Expr:
    "("Expr")" |
    {Not} "!" expression=Primary | 
    Atomic
;

MulOrDiv returns Expr:
    Primary ({MulOrDiv.left=current} op=("*"|"/") right=Primary)*;

PlusOrMinus returns Expr:
    MulOrDiv ({PlusOrMinus.left=current} op=("+"|"-") right=MulOrDiv)*;

Comparison returns Expr:
    PlusOrMinus({Comparison.left=current} op=(">="|"<="|">"|"<") right=PlusOrMinus)*;

Equality returns Expr: 
    Comparison({Equality.left=current} op=("=="|"!=" |"==="| "!==") right=Comparison)*;

And returns Expr:
    Equality({And.left=current} op=("&&") right=Equality)*;

Or returns Expr:
    And({Or.left=current} "$$" right=And)*;

Expr: Or;