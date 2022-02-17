/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { Grammar } from "langium";
import { parseHelper } from "langium/lib/test"
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";

const services = createHotDrinkDslServices();
const helper = parseHelper<Grammar>(services);
describe("Variable validation", () => {
    it('gets a warning if variable have a uppercase starting letter as name', async () => {
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
    it('gets 2 warnings if both variables have a uppercase starting letter', async () => {
        const documentContent = `component T { 
                                    var A; 
                                    var b;
                                    var C; 
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
                                }`;
        const doc = await helper(documentContent);
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
        expect(diagnostics.length).toBe(0)
    });
})