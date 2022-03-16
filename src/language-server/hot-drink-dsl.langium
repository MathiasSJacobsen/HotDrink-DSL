grammar HotDrinkDsl
hidden(WS, SL_COMMENT, ML_COMMENT)

terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
terminal SL_COMMENT: /\/\/[^\n\r]*/;

Model:
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

Atomic returns Expr:
    {IntConst} value=INT |
    {StringConst} value=STRING |
    {BoolConst} value=("true" | "false") |
    {VarRef} value=[Variable]
;

Primary returns Expr:
    {Parenthesis} "("expression=Expr")" |
    {Not} "!" expression=Primary | 
    Atomic
;

MulOrDiv returns Expr:
    Primary ({MulOrDiv.left=current} op=("*"|"/") right=Primary)*;

PlusOrMinus returns Expr:
    MulOrDiv ({PlusOrMinus.left=current} op=("+"|"-") right=MulOrDiv)*;

Comparison returns Expr:
    PlusOrMinus ({Comparison.left=current} op=(">="|"<="|">"|"<") right=PlusOrMinus)*;

Equality returns Expr: 
    Comparison ({Equality.left=current} op=("=="|"!=" |"==="| "!==") right=Comparison)*;

And returns Expr:
    Equality ({And.left=current} op=("&&") right=Equality)*;

Or returns Expr:
    And ({Or.left=current} op=("$$") right=And)*;

Expr: Or;