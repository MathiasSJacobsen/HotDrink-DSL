/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { parseHelper } from "langium/lib/test"
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { ERRORSEVERITY, HINTSERVERITY, WARNINGSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices().hotdrinkDSL;
const helper = parseHelper<Model>(services);

describe("Constraint validation", () => {
    describe("Name starts with lowercase", () => {
        it('gets a warning if constraint name starts with uppercase letter', async () => {
            const documentContent = `component T {
                var a = true, b, c;
            
                constraint G {
                    method(a, b -> c) => true;
                    m(a, c -> b) => true;
                }
            }`;
            const expectation = { 
                    message: "Constraint should start with lowercase.", 
                    severity: WARNINGSEVERITY
                }
            ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
        
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
        it("gets two warnings if both constraints have a uppercase starting letter", async () => {
            const documentContent = `component T {
                var a = true, b, c;

            
                constraint G {
                    method(a, b -> c) => true;
                    m2(a, c -> b) => true;
                }
                constraint A {
                    m(a, b -> c) => true;
                    m4(a, c -> b) => true;
                }
            }`;
            const expectation = { 
                    message: "Constraint should start with lowercase.", 
                    severity: WARNINGSEVERITY 
                }
            ;
            const doc = await helper(documentContent);
            const diagnostics = (await services.validation.DocumentValidator.validateDocument(doc)).filter(d => d.severity === WARNINGSEVERITY);
            diagnostics.forEach((diagnostic) => {
                expect(diagnostic).toEqual(expect.objectContaining(expectation))
            })
        })
        it("gets get no waring if everything is ok", async () => {
            const documentContent = `component T {
                var a = true, b, c;

                constraint g {
                    method(a, b -> c) => true;
                    m2(a, c -> b) => true;

                }
                constraint a {
                    m(a, b -> c) => true;
                    me(a, c -> b) => true;
                }
            }`;
            const doc = await helper(documentContent);
            const diagnostics = (await services.validation.DocumentValidator.validateDocument(doc)).filter(d => d.severity === WARNINGSEVERITY);
            
            expect(diagnostics.length).toBe(0)
        })
    })

    describe("All methods inside a constraint should have a unique name", () => {
        it("gets nothing if all good", async () => {
            const documentContent = `component T {
                var a = true, b, c;
            
                constraint g {
                    method(a, b -> c) => true;
                    me(a, c -> b) => false;
                    meth(a, c -> b) => false;
                }
            }`;

            const doc = await helper(documentContent);
            const diagnostics = (await services.validation.DocumentValidator.validateDocument(doc)).filter(d => d.severity === WARNINGSEVERITY);
            
            expect(diagnostics.length).toBe(0)
        })
    })
    describe("All methods inside a constraint uses the same variables", () => {
        it("get a error if not all methods inside a constraint uses the same variables", async()=> {
            const documentContent = `component T {
                var a = true, b, c;
            
                constraint g {
                    method(a, b -> c) => true;
                    m(a -> b) => false;
                }
            }`;

            const expectation = { 
                message: "All methods inside a given constraint needs to reference all the same variables.", 
                severity: ERRORSEVERITY
            };
            const doc = await helper(documentContent);
            const diagnostics = (await services.validation.DocumentValidator.validateDocument(doc)).filter(d => d.severity === ERRORSEVERITY);
            
            expect(diagnostics.length).toBe(1)
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    })
    describe("hints", () => {
        it("remove constraint hint", async()=> {
            const documentContent = `component T {
                var a = true, b, c;
            
                constraint g {
                    method(a, b -> c) => true;
                    m(a, c -> b) => false;
                }
            }`;

            const expectation = { 
                message: "Able to remove constraint", 
                severity: HINTSERVERITY
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
            
            expect(diagnostics.length).toBe(1)
            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    });
})