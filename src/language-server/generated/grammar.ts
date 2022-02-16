/******************************************************************************
 * This file was generated by langium-cli 0.2.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/

import { loadGrammar, Grammar } from 'langium';

let loaded: Grammar | undefined;
export const grammar = (): Grammar => loaded || (loaded = loadGrammar(`{
  "$type": "Grammar",
  "usedGrammars": [],
  "hiddenTokens": [
    {
      "$refText": "WS"
    },
    {
      "$refText": "SL_COMMENT"
    },
    {
      "$refText": "ML_COMMENT"
    }
  ],
  "metamodelDeclarations": [],
  "rules": [
    {
      "$type": "TerminalRule",
      "name": "WS",
      "regex": "\\\\s+"
    },
    {
      "$type": "TerminalRule",
      "name": "ID",
      "regex": "[_a-zA-Z][\\\\w_]*"
    },
    {
      "$type": "TerminalRule",
      "name": "INT",
      "type": "number",
      "regex": "[0-9]+"
    },
    {
      "$type": "TerminalRule",
      "name": "STRING",
      "regex": "\\"[^\\"]*\\"|'[^']*'"
    },
    {
      "$type": "TerminalRule",
      "name": "ML_COMMENT",
      "regex": "\\\\/\\\\*[\\\\s\\\\S]*?\\\\*\\\\/"
    },
    {
      "$type": "TerminalRule",
      "name": "SL_COMMENT",
      "regex": "\\\\/\\\\/[^\\\\n\\\\r]*"
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Model",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Alternatives",
        "elements": [
          {
            "$type": "Assignment",
            "feature": "imports",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "Import"
              }
            },
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "component",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "Component"
              }
            },
            "elements": []
          }
        ],
        "cardinality": "*"
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Import",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "import",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "funcs",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            }
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Keyword",
                "value": ",",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "funcs",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "ID"
                  }
                }
              }
            ],
            "cardinality": "*"
          },
          {
            "$type": "Keyword",
            "value": "from"
          },
          {
            "$type": "Assignment",
            "feature": "file",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "STRING"
              }
            }
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Component",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "component",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            }
          },
          {
            "$type": "Keyword",
            "value": "{"
          },
          {
            "$type": "Alternatives",
            "elements": [
              {
                "$type": "Assignment",
                "feature": "vars",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "Variable"
                  }
                },
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "constraints",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "Constraint"
                  }
                },
                "elements": []
              }
            ],
            "cardinality": "*"
          },
          {
            "$type": "Keyword",
            "value": "}"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Variable",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "RuleCall",
        "arguments": [],
        "rule": {
          "$refText": "Var"
        },
        "elements": []
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Var",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "var",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            }
          },
          {
            "$type": "Keyword",
            "value": ";"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Constraint",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "constraint",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            },
            "elements": [],
            "cardinality": "?"
          },
          {
            "$type": "Keyword",
            "value": "{"
          },
          {
            "$type": "Assignment",
            "feature": "methods",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "Method"
              }
            },
            "cardinality": "+"
          },
          {
            "$type": "Keyword",
            "value": "}"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "ImpFunction",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            },
            "elements": []
          },
          {
            "$type": "Keyword",
            "value": "("
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Assignment",
                "feature": "args",
                "operator": "+=",
                "terminal": {
                  "$type": "CrossReference",
                  "type": {
                    "$refText": "Variable"
                  }
                },
                "elements": []
              },
              {
                "$type": "Group",
                "elements": [
                  {
                    "$type": "Keyword",
                    "value": ",",
                    "elements": []
                  },
                  {
                    "$type": "Assignment",
                    "feature": "args",
                    "operator": "+=",
                    "terminal": {
                      "$type": "CrossReference",
                      "type": {
                        "$refText": "Variable"
                      }
                    }
                  }
                ],
                "cardinality": "*"
              }
            ],
            "cardinality": "?"
          },
          {
            "$type": "Keyword",
            "value": ")"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Method",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Assignment",
            "feature": "name",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ID"
              }
            },
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "args",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "Arguments"
              }
            }
          },
          {
            "$type": "Keyword",
            "value": "=>"
          },
          {
            "$type": "Keyword",
            "value": "{"
          },
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "Body"
            }
          },
          {
            "$type": "Keyword",
            "value": "}"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Body",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Alternatives",
        "elements": [
          {
            "$type": "Assignment",
            "feature": "value",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "ImpFunction"
              }
            },
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "value",
            "operator": "=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "Expr"
              }
            },
            "elements": []
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "VariableReference",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Assignment",
            "feature": "ref",
            "operator": "=",
            "terminal": {
              "$type": "CrossReference",
              "type": {
                "$refText": "Variable"
              }
            },
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "hasMark",
            "operator": "?=",
            "terminal": {
              "$type": "Keyword",
              "value": "!"
            },
            "elements": [],
            "cardinality": "?"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Arguments",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "Keyword",
            "value": "(",
            "elements": []
          },
          {
            "$type": "Assignment",
            "feature": "variables",
            "operator": "+=",
            "terminal": {
              "$type": "RuleCall",
              "arguments": [],
              "rule": {
                "$refText": "VariableReference"
              }
            }
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Keyword",
                "value": ",",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "variables",
                "operator": "+=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "VariableReference"
                  }
                }
              }
            ],
            "cardinality": "*"
          },
          {
            "$type": "Keyword",
            "value": "->"
          },
          {
            "$type": "Assignment",
            "feature": "final",
            "operator": "+=",
            "terminal": {
              "$type": "CrossReference",
              "type": {
                "$refText": "Variable"
              }
            }
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Keyword",
                "value": ",",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "final",
                "operator": "+=",
                "terminal": {
                  "$type": "CrossReference",
                  "type": {
                    "$refText": "Variable"
                  }
                }
              }
            ],
            "cardinality": "*"
          },
          {
            "$type": "Keyword",
            "value": ")"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Atomic",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "Alternatives",
        "elements": [
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "IntConst",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "value",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "INT"
                  }
                }
              }
            ]
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "StringConst",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "value",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "STRING"
                  }
                }
              }
            ]
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "BoolConst",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "value",
                "operator": "=",
                "terminal": {
                  "$type": "Alternatives",
                  "elements": [
                    {
                      "$type": "Keyword",
                      "value": "true",
                      "elements": []
                    },
                    {
                      "$type": "Keyword",
                      "value": "false"
                    }
                  ]
                }
              }
            ]
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "VarRef",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "value",
                "operator": "=",
                "terminal": {
                  "$type": "CrossReference",
                  "type": {
                    "$refText": "Variable"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Primary",
      "hiddenTokens": [],
      "type": "Expr",
      "alternatives": {
        "$type": "Alternatives",
        "elements": [
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Keyword",
                "value": "(",
                "elements": []
              },
              {
                "$type": "RuleCall",
                "arguments": [],
                "rule": {
                  "$refText": "Expr"
                }
              },
              {
                "$type": "Keyword",
                "value": ")"
              }
            ]
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "Not",
                "elements": []
              },
              {
                "$type": "Keyword",
                "value": "!"
              },
              {
                "$type": "Assignment",
                "feature": "expression",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "Primary"
                  }
                }
              }
            ]
          },
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "Atomic"
            },
            "elements": []
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "MulOrDiv",
      "hiddenTokens": [],
      "type": "Expr",
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "Primary"
            },
            "elements": []
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "MulOrDiv",
                "feature": "left",
                "operator": "=",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "op",
                "operator": "=",
                "terminal": {
                  "$type": "Alternatives",
                  "elements": [
                    {
                      "$type": "Keyword",
                      "value": "*",
                      "elements": []
                    },
                    {
                      "$type": "Keyword",
                      "value": "/"
                    }
                  ]
                }
              },
              {
                "$type": "Assignment",
                "feature": "right",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "Primary"
                  }
                }
              }
            ],
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "PlusOrMinus",
      "hiddenTokens": [],
      "type": "Expr",
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "MulOrDiv"
            },
            "elements": []
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "PlusOrMinus",
                "feature": "left",
                "operator": "=",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "op",
                "operator": "=",
                "terminal": {
                  "$type": "Alternatives",
                  "elements": [
                    {
                      "$type": "Keyword",
                      "value": "+",
                      "elements": []
                    },
                    {
                      "$type": "Keyword",
                      "value": "-"
                    }
                  ]
                }
              },
              {
                "$type": "Assignment",
                "feature": "right",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "MulOrDiv"
                  }
                }
              }
            ],
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Comparison",
      "hiddenTokens": [],
      "type": "Expr",
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "PlusOrMinus"
            },
            "elements": []
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "Comparison",
                "feature": "left",
                "operator": "=",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "op",
                "operator": "=",
                "terminal": {
                  "$type": "Alternatives",
                  "elements": [
                    {
                      "$type": "Keyword",
                      "value": ">=",
                      "elements": []
                    },
                    {
                      "$type": "Keyword",
                      "value": "<="
                    },
                    {
                      "$type": "Keyword",
                      "value": ">"
                    },
                    {
                      "$type": "Keyword",
                      "value": "<"
                    }
                  ]
                }
              },
              {
                "$type": "Assignment",
                "feature": "right",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "PlusOrMinus"
                  }
                }
              }
            ],
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Equality",
      "hiddenTokens": [],
      "type": "Expr",
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "Comparison"
            },
            "elements": []
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "Equality",
                "feature": "left",
                "operator": "=",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "op",
                "operator": "=",
                "terminal": {
                  "$type": "Alternatives",
                  "elements": [
                    {
                      "$type": "Keyword",
                      "value": "==",
                      "elements": []
                    },
                    {
                      "$type": "Keyword",
                      "value": "!="
                    },
                    {
                      "$type": "Keyword",
                      "value": "==="
                    },
                    {
                      "$type": "Keyword",
                      "value": "!=="
                    }
                  ]
                }
              },
              {
                "$type": "Assignment",
                "feature": "right",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "Comparison"
                  }
                }
              }
            ],
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "And",
      "hiddenTokens": [],
      "type": "Expr",
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "Equality"
            },
            "elements": []
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "And",
                "feature": "left",
                "operator": "=",
                "elements": []
              },
              {
                "$type": "Assignment",
                "feature": "op",
                "operator": "=",
                "terminal": {
                  "$type": "Keyword",
                  "value": "&&",
                  "elements": []
                }
              },
              {
                "$type": "Assignment",
                "feature": "right",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "Equality"
                  }
                }
              }
            ],
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Or",
      "hiddenTokens": [],
      "type": "Expr",
      "alternatives": {
        "$type": "Group",
        "elements": [
          {
            "$type": "RuleCall",
            "arguments": [],
            "rule": {
              "$refText": "And"
            },
            "elements": []
          },
          {
            "$type": "Group",
            "elements": [
              {
                "$type": "Action",
                "type": "Or",
                "feature": "left",
                "operator": "=",
                "elements": []
              },
              {
                "$type": "Keyword",
                "value": "$$"
              },
              {
                "$type": "Assignment",
                "feature": "right",
                "operator": "=",
                "terminal": {
                  "$type": "RuleCall",
                  "arguments": [],
                  "rule": {
                    "$refText": "And"
                  }
                }
              }
            ],
            "cardinality": "*"
          }
        ]
      }
    },
    {
      "$type": "ParserRule",
      "parameters": [],
      "name": "Expr",
      "hiddenTokens": [],
      "alternatives": {
        "$type": "RuleCall",
        "arguments": [],
        "rule": {
          "$refText": "Or"
        },
        "elements": []
      }
    }
  ],
  "name": "HotDrinkDsl",
  "definesHiddenTokens": true
}`));
