/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { Grammar } from "langium";
import { parseHelper } from "langium/lib/test"
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";

const services = createHotDrinkDslServices();
const helper = parseHelper<Grammar>(services);
describe("Variable validation", () => {
<<<<<<< HEAD
    it('gets a warning if variable have a uppercase starting letter as name', async () => {
=======
    it('have a variable with a uppercase starting letter', async () => {
>>>>>>> 28edbbe (Config change)
        const documentContent = `component T { 
                                    var A; 
                                    var b;
                                    var c; 
                                }`;
        const expectation = [{ message: "Var name should start with lowercase.", severity: 2 }];
        const doc = await helper(documentContent);
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
        expect(diagnostics[0]).toEqual(expect.objectContaining({
            message: expectation[0].message,
            severity: expectation[0].severity,
        }))
    });
<<<<<<< HEAD
    it('gets two warnings if both variables have a uppercase starting letter', async () => {
=======
    it('have two variable with a uppercase starting letter', async () => {
>>>>>>> 28edbbe (Config change)
        const documentContent = `component T { 
                                    var A; 
                                    var b;
                                    var C; 
<<<<<<< HEAD

                                    constraint c1 {
                                        method(A, C -> b) => {
                                            true
                                        }
                                    }
=======
>>>>>>> 28edbbe (Config change)
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
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
<<<<<<< HEAD
=======
        console.log(JSON.stringify(diagnostics, undefined, 2)); // Store this logged string somewhere
>>>>>>> 28edbbe (Config change)
        
        expect(diagnostics.length).toBe(2)
        
        diagnostics.forEach((diagnostic, idx) => {
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
                                        method(a, c -> b) => {
                                            true
                                        }
                                    }
                                }`;
        const doc = await helper(documentContent);
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
        expect(diagnostics.length).toBe(0)
    });
})