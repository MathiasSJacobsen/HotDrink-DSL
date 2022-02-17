/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { Grammar } from "langium";
import { parseHelper } from "langium/lib/test"
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";

const services = createHotDrinkDslServices();
const helper = parseHelper<Grammar>(services);
describe("Method validation", () => {
    it.skip('gets a warning if method name starts with uppercase letter', async () => {
        const documentContent = `component T {
            var a;
            var b;
            var c;
        
            constraint g {
                Method(a, b -> c) => {
                    true
                }
                
            }
        }`;
        const expectation = { 
                message: "Methods should start with lowercase.", 
                severity: 2 
            }
        ;
        const doc = await helper(documentContent);
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
        console.log(JSON.stringify(diagnostics, undefined, 2)); // Store this logged string somewhere
        
        expect(diagnostics).toBe(1)
        expect(expectation).not


    })
})