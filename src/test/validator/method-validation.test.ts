/* we expose some testing functionality in the framework, but none for validation so far. For a quick custom setup you could simply check whether the diagnostics returned from the DocumentValidator match whatever you expect.  */

import { parseHelper } from "langium/lib/test"
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { WARNINGSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices().hotdrinkDSL;
const helper = parseHelper<Model>(services);
describe("Method validation", () => {
    it('gets a warning if method name starts with uppercase letter', async () => {
        const documentContent = `component T {
            var a;
            var b;
            var c;
        
            constraint g {
                Method(a, b -> c) => true;                
            }
        }`;
        const expectation = { 
                message: "Methods should start with lowercase.", 
                severity: WARNINGSEVERITY 
            }
        ;
        const doc = await helper(documentContent);
        const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);
        
        expect(diagnostics.length).toBe(1)
        expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
    }) // TODO: missing validaton
})