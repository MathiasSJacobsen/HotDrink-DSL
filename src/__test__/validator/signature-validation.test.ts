import { parseHelper } from "langium/lib/test"
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { ERRORSEVERITY, INFOSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices().hotdrinkDSL;
const helper = parseHelper<Model>(services);

describe("Signature validation", () => {
    describe("Signature can not have same variable twice", () => {

        it("gets a error if signature contains same variable twice (input)",async () => {
            const documentContent = `component T {
                var a = true;
                var c = false;
                
                constraint c {
                    method(a, a -> c) => true;
                }
            }`;
            const expectation = { 
                message: "Can not use the same variable more then once in a signature.", 
                severity: ERRORSEVERITY
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
            
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
        it("gets a error if argument contains same variable twice (output)",async () => {
            const documentContent = `component t {
                var a = true;
                var c = false;
                
                constraint c {
                    method(a -> c, c) => [true, false];
                }
            }`;
            const expectation = { 
                message: "Can not use the same variable more then once in a signature.", 
                severity: ERRORSEVERITY
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
            
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    })
    describe('Variables inside a signature with <b>!</b> should be warned about', () => {
        it('gets a waring if ! in use', async () => {
            const documentContent = `component t {
                var a = true;
                var b = false;
                var c = false;
                constraint c {
                    method(a, b! -> c) => true;
                    (a, c -> b) => false;
                }
            }`;
            const expectation = { 
                message: "<feature not implemented>", 
                severity: INFOSEVERITY
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
            
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    })
})