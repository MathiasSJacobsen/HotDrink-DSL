import { Grammar } from "langium";
import { parseHelper } from "langium/lib/test"
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { ERRORSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices();
const helper = parseHelper<Grammar>(services);

describe("Statement validation", () => {
    describe("Statement can not have same variable twice", () => {

        it("gets a error if argument contains same variable twice (input)",async () => {
            const documentContent = `component T {
                var a;
                var c;
                
                constraint c {
                    method(a, a -> c) => true;
                }
            }`;
            const expectation = { 
                message: "Can not use the same variable more then once in a statement.", 
                severity: ERRORSEVERITY
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
            
            expect(diagnostics.length).toBe(1)
            
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
        it("gets a error if argument contains same variable twice (output)",async () => {
            const documentContent = `component t {
                var a;
                var c;
                
                constraint c {
                    method(a -> c, c) => [true, false];
                }
            }`;
            const expectation = { 
                message: "Can not use the same variable more then once in a statement.", 
                severity: ERRORSEVERITY
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
            
            expect(diagnostics.length).toBe(1)
            
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    })
})