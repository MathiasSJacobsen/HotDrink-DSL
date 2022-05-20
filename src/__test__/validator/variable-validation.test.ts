/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { parseHelper } from "langium/lib/test";
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { HINTSERVERITY, WARNINGSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices().hotdrinkDSL;
const helper = parseHelper<Model>(services);
describe("Variable validation", () => {
  describe("warnings", () => {
    it("gets a warning if variable have a uppercase starting letter as name", async () => {
      const documentContent = `component T { 
                var A = 3; 
                var b = 1;
                var c = 2; 
            }`;
      const expectation = [
        {
          message: "Var name should start with lowercase.",
          severity: WARNINGSEVERITY,
        },
        {
          message: "Variable not in use.",
          severity: WARNINGSEVERITY,
        },
        {
          message: "Variable not in use.",
          severity: WARNINGSEVERITY,
        },
        {
          message: "Variable not in use.",
          severity: WARNINGSEVERITY,
        },
      ];
      const doc = await helper(documentContent);
      const diagnostics =
        await services.validation.DocumentValidator.validateDocument(doc);

      expect(diagnostics.length).toBe(4);
      expect(diagnostics.pop()).toEqual(
        expect.objectContaining(expectation.pop())
      );
      expect(diagnostics.pop()).toEqual(
        expect.objectContaining(expectation.pop())
      );
      expect(diagnostics.pop()).toEqual(
        expect.objectContaining(expectation.pop())
      );
      expect(diagnostics.pop()).toEqual(
        expect.objectContaining(expectation.pop())
      );
    });

    it("gets two warnings if both variables have a uppercase starting letter", async () => {
      const documentContent = `component T { 
                var A = 1; 
                var b = 2;
                var C = 3;
                
                constraint c1 {
                    method(A, C -> b) => true;
                    
                }
            }`;
      const expectation = [
        {
          message: "Var name should start with lowercase.",
          severity: WARNINGSEVERITY,
        },
        {
          message: "Var name should start with lowercase.",
          severity: WARNINGSEVERITY,
        },
        {
          message: "Able to make permutations",
          severity: HINTSERVERITY,
        },
      ];
      const doc = await helper(documentContent);
      const diagnostics =
        await services.validation.DocumentValidator.validateDocument(doc);

      expect(diagnostics.length).toBe(4);
      diagnostics.pop()
      expect(diagnostics.pop()).toEqual(
        expect.objectContaining(expectation.pop())
      );
      expect(diagnostics.pop()).toEqual(
        expect.objectContaining(expectation.pop())
      );
      expect(diagnostics.pop()).toEqual(
        expect.objectContaining(expectation.pop())
      );
    });
  });
  describe("errors", () => {
    it("have no diagnostic errors if none there", async () => {
      const documentContent = `component T { 
                var a; 
                var b;
                var c; 
                
                constraint c1 {
                    method(a, b -> c) => true;
                    (a, c -> b) => true;
                }
            }`;
      const doc = await helper(documentContent);
      const diagnostics =
        await services.validation.DocumentValidator.validateDocument(doc);

      expect(diagnostics.every((d) => d.severity !== 1)).toBe(true);
    });
  });
  describe("hints", () => {
    it("returns a hint to make the variable lowercase", async () => {
      const documentContent = `component T { 
                    var a; 
                    var b = true;
                    var c = false; 

                                    constraint c1 {
                                        method(a, b -> c) => true;
                                        (a, c -> b) => true;
                                    }
                                }`;

      const expectation = {
        message: "Able to initialize all variables to zero",
        severity: HINTSERVERITY,
      };
      const doc = await helper(documentContent);
      const diagnostics =
        await services.validation.DocumentValidator.validateDocument(doc);

      expect(diagnostics.length).toBe(2);
      expect(diagnostics[0]).toEqual(expect.objectContaining(expectation));
    });
  });
});
