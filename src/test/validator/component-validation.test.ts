import { parseHelper } from "langium/lib/test"
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { ERRORSEVERITY, WARNINGSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices();
const helper = parseHelper<Model>(services);


describe("Component validation", () => {
    describe("Every var in a component must have a unique name", () => {
        it('gets a error if two vars have the same name property', async () => {
            const documentContent = `component T {
                var a;
                var b;
                var a;

                constraint c1 {
                    method(a -> b) => true;
                }
            }`;
            const expectation = {
                message: "Component vars should have unique names.",
                severity: ERRORSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);

            expect(diagnostics.length).toBe(1)

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    })
    describe('Every constraint in a component must have a unique name', () => {
        it('gets a warning if two constraint have the same name property', async () => {
            const documentContent = `component T {
                var a;
                var b;
                var c;

                constraint c1 {
                    method(a, b -> c) => true;
                }
                constraint c1 {
                    method(a, b -> c) => false;
                }
            }`;
            const expectation = {
                message: "Component constraints should have unique names.",
                severity: WARNINGSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);


            expect(diagnostics.length).toBe(1)

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
        it('gets a warning if more then two constraint have the same name property', async () => {
            const documentContent = `component T {
                var a;
                var b;
                var c;

                constraint c1 {
                    method(a, b -> c) => true;
                }
                constraint c1 {
                    method(a, b -> c) => false;
                }
                constraint c1 {
                    method(a, b -> c) => true;
                }
            }`;
            const expectation = {
                message: "Component constraints should have unique names.",
                severity: WARNINGSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);

            expect(diagnostics.length).toBe(2)

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
            expect(diagnostics[1]).toEqual(expect.objectContaining(expectation))

        })
    })
    describe('Range', () => {
        it('constraint range', async () => {
            const documentContent = `component T {
                var a;
                var b;
                var c;

                constraint c1 {
                    method(a, b -> c) => true;
                }
                constraint c1 {
                    method(a, b -> c) => false;
                }
            }`;
            const expectation = {
                range: { 
                    start: { 
                        character: 27, 
                        line: 8
                    },
                    end: {
                        character: 29, 
                        line: 8 
                    } 
                }
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);
            
            expect(diagnostics.length).toBe(1)

            expect(diagnostics[0]).toEqual(expect.objectContaining({
                range: expect.objectContaining({
                    start: expectation.range.start, 
                    end: expectation.range.end
                })
            }))
        })
    })
    describe("Unused variables", () => {
        it('gets a warning when a variable is not in use by any method', async () => {
            const documentContent = `component T {
                var a;
                var b;
                var c;
                var p;
            
                constraint c {
                    method(a, b -> c) => true;
                }
            }`;
            const expectation = {
                message: "Variable not in use.",
                severity: WARNINGSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);

            expect(diagnostics.length).toBe(1)

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
        it("shows the waring at the right variable", async () => {
            const documentContent = `component T {
                var a;
                var b;
                var c;
                var p;
            
                constraint c {
                    method(a, b -> c) => false;
                }
            }`;
            const expectation = {
                message: "Variable not in use.",
                severity: WARNINGSEVERITY,
                range: {
                    end: {
                        character: 22,
                        line: 4,
                    },
                    start: {
                        character: 16,
                        line: 4,
                    },
                }
            };
            
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc.document);

            expect(diagnostics.length).toBe(1)

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    })
})