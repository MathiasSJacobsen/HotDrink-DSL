/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { parseHelper } from "langium/lib/test"
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";

const services = createHotDrinkDslServices().hotdrinkDSL;
const helper = parseHelper<Model>(services);
describe("Variable validation", () => {
    it('gets a warning if variable have a uppercase starting letter as name', async () => {

        const documentContent = `component T { 
                                    var A; 
                                    var b;
                                    var c; 
                                }`;
        const expectation = [{ message: "Var name should start with lowercase.", severity: 2 }];
        const doc = await helper(documentContent);
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
        expect(diagnostics[0]).toEqual(expect.objectContaining({
            message: expectation[0].message,
            severity: expectation[0].severity,
        }))
    });

    it('gets two warnings if both variables have a uppercase starting letter', async () => {
        const documentContent = `component T { 
                                    var A; 
                                    var b;
                                    var C; 

                                    constraint c1 {
                                        method(A, C -> b) => true;

                                    }
                                }`;
        const expectation = [
            { 
                message: "Var name should start with lowercase.", 
                severity: 2 
            }, 
            { 
                message: "Var name should start with lowercase.", 
                severity: 2
            }
        ];
        const doc = await helper(documentContent);
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
        
        expect(diagnostics.length).toBe(3)
        
        diagnostics.slice(0,-1).forEach((diagnostic, idx) => {
            expect(diagnostic).toEqual(expect.objectContaining({
                message: expectation[idx].message,
                severity: expectation[idx].severity,
            }))
        })
    });
    it('have no diagnostic errors if none there', async () => {
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
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
        expect(diagnostics.length).toBe(0)
    });
})