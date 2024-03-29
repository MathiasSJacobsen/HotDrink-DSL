/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { parseHelper } from "langium/lib/test";
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { ERRORSEVERITY, HINTSERVERITY, WARNINGSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices().hotdrinkDSL;
const helper = parseHelper<Model>(services);
describe("Method validation", () => {
  describe("hints", () => {
    it("get a hint to permute if only one method in a constraint", async () => {
      const documentContent = `component T {
                var a = true, b, c;
                
                constraint g {
                    method(a, b -> c) => true;  
                }
            }`;
      const expectation = {
        message: "Able to make permutations",
        severity: HINTSERVERITY,
      };
      const doc = await helper(documentContent);
      const diagnostics =
        await services.validation.DocumentValidator.validateDocument(doc);

      expect(diagnostics.length).toBe(2);
      expect(diagnostics[0]).toEqual(expect.objectContaining(expectation));
    });
  });
  describe("warnings", () => {
    it("gets a warning if method name starts with uppercase letter", async () => {
      const documentContent = `component T {
            var a = true, b, c;

            constraint g {
                Method(a, b -> c) => true;  
                m(a, c -> b) => true;
            }
        }`;
      const expectation = {
        message: "Methods should start with lowercase.",
        severity: WARNINGSEVERITY,
      };
      const doc = await helper(documentContent);
      const diagnostics =
        (await services.validation.DocumentValidator.validateDocument(doc)).filter(d => d.severity === WARNINGSEVERITY);

      expect(diagnostics.length).toBe(1);
      expect(diagnostics[0]).toEqual(expect.objectContaining(expectation));
    }); // TODO: missing validaton
  });
  describe('errors', () => {
    it("get a error if the number of values returned isn't the same as output variables",async () => {
      const documentContent = `component T {
        var f: number = 0;

        var c, d;

        constraint grader {
          m1(c -> f,d) => (c * 9/5 + 32);
          m2(f,d -> c) => (f - 32) * 5/9;
      }
    }`;
  const expectation = {
    message: "The body of the method needs to return the same number of variables that there are output-variables.",
    severity: ERRORSEVERITY,
  };
  const doc = await helper(documentContent);
  const diagnostics =
    (await services.validation.DocumentValidator.validateDocument(doc)).filter(d => d.severity === ERRORSEVERITY);

  expect(diagnostics.length).toBe(1);
  expect(diagnostics[0]).toEqual(expect.objectContaining(expectation));
    });
    it("get a error if there is only one output variable but there is more then one return value",async () => {
      const documentContent = `component T {
        var f: number = 0;

        var c, d;

        constraint grader {
          m1(c,f -> d) => (c * 9/5 + 32);
          m2(f,d -> c) => [(f - 32) * 5/9, 2];
      }
    }`;
  const expectation = {
    message: "The body of the method needs to return the same number of variables that there are output-variables.",
    severity: ERRORSEVERITY,
  };
  const doc = await helper(documentContent);
  const diagnostics =
    (await services.validation.DocumentValidator.validateDocument(doc)).filter(d => d.severity === ERRORSEVERITY);

  expect(diagnostics.length).toBe(1);
  expect(diagnostics[0]).toEqual(expect.objectContaining(expectation));
    });
  });
});
