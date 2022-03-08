import { Grammar } from "langium";
import { parseHelper } from "langium/lib/test"
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { WARNINGSEVERITY } from "../test-utils";


const services = createHotDrinkDslServices();
const helper = parseHelper<Grammar>(services);


describe("Model validation", () => {
    describe("Function is not imported twice", () => {
        it('gets a warning if function is imported twice', async () => {
            const documentContent = `import t, k, t from "test.js";`;
            const expectation = {
                message: "Should not import the same function more then once.",
                severity: WARNINGSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);

            expect(diagnostics.length).toBe(1)

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
        it('gets a warning if function is imported twice, on the right line', async () => {
            const documentContent = `import t, k, t from "test.js";`;

            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);

            expect(diagnostics.length).toBe(1)

            expect(diagnostics[0]).toEqual(expect.objectContaining({
                range: expect.objectContaining({
                    end: expect.objectContaining({
                        line: 0
                    }),
                    start: expect.objectContaining({
                        line: 0
                    })
                })
            }))
        })
        describe("All components should have unique names", () => {
            it("gets a warning if two components have the same name", async () => {
                const documentContent = `import t, k from "test.js";
                component T {
                    var a;
                    var b;
                    var c;
    
                    constraint c1 {
                        method(a, c -> b) => {
                            true
                        }
                    }
                }
                component T {

                }
                `;

                const expectation = {
                    message: "Component names should be unique",
                    severity: WARNINGSEVERITY
                }
    

                const doc = await helper(documentContent);
                const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
                
                expect(diagnostics.length).toBe(1)

                expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
            })
        })
    })
})