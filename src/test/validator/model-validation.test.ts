import { parseHelper } from "langium/lib/test";
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { ERRORSEVERITY, WARNINGSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices();
const helper = parseHelper<Model>(services.hotdrinkDSL);

describe("Model validation", () => {
  describe("warnings", () => {
    describe("Function is not imported twice", () => {
      it("gets a warning if function is imported twice", async () => {
        const documentContent = `import { t, k, t }from "test.js"`;
        const expectation = {
          message: "Should not import the same function more then once.",
          severity: ERRORSEVERITY,
        };
        const doc = await helper(documentContent);
        const diagnostics =
          await services.hotdrinkDSL.validation.DocumentValidator.validateDocument(
            doc
          );

        expect(diagnostics.length).toBe(1);

        expect(diagnostics[0]).toEqual(expect.objectContaining(expectation));
      });
      it("gets a warning if function is imported twice, on the right line", async () => {
        const documentContent = `import { t, k, t } from "test.js"`;

        const doc = await helper(documentContent);
        const diagnostics =
          await services.hotdrinkDSL.validation.DocumentValidator.validateDocument(
            doc
          );

        expect(diagnostics.length).toBe(1);

        expect(diagnostics[0]).toEqual(
          expect.objectContaining({
            range: expect.objectContaining({
              end: expect.objectContaining({
                line: 0,
              }),
              start: expect.objectContaining({
                line: 0,
              }),
            }),
          })
        );
      });
      describe("All components should have unique names", () => {
        it("gets a warning if two components have the same name", async () => {
          const documentContent = `
                component t {
                    var a = true, b, c;
                    
                    constraint c1 {
                        method(a, c -> b) => true;
                        (a, c -> b) => true;
                        
                    }
                }
                component t {
                    
                }
                `;

          const expectation = {
            message: "Component names should be unique",
            severity: WARNINGSEVERITY,
          };

          const doc = await helper(documentContent);
          const diagnostics =
            await services.hotdrinkDSL.validation.DocumentValidator.validateDocument(
              doc
            );

          expect(diagnostics.length).toBe(1);

          expect(diagnostics[0]).toEqual(expect.objectContaining(expectation));
        });
      });
    });
  });
});
