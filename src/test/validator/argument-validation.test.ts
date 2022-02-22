import { Grammar } from "langium";
import { parseHelper } from "langium/lib/test"
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";

const services = createHotDrinkDslServices();
const helper = parseHelper<Grammar>(services);

describe("Argument validation", () => {
    describe("Argument can not have same variable twice", () => {

        it("gets a error if argument contains same variable twice",async () => {
            const documentContent = `component T {
                var a;
                var c;
                
                constraint c {
                    method(a, a -> c) => {
                        true
                    }
                }
            }`;
            const expectation = { 
                message: "Can not use the same variable more then once in an argument.", 
                severity: 1 
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
            
            expect(diagnostics.length).toBe(1)
            
            expect(expectation).toEqual(expect.objectContaining(expectation))
        })
    })
})