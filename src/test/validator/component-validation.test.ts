import { parseHelper } from "langium/lib/test"
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";
import { ERRORSEVERITY, HINTSERVERITY, WARNINGSEVERITY } from "../test-utils";

const services = createHotDrinkDslServices().hotdrinkDSL;
const helper = parseHelper<Model>(services);


describe("Component validation", () => {
    describe("Every var in a component must have a unique name", () => {
        it('gets a error if two vars have the same name property', async () => {
            const documentContent = `component T {
                var a = true;
                var b = false;
                var a = true;

                constraint c1 {
                    method(a -> b) => true;
                    (a -> b) => true;

                }
            }`;
            const expectation = {
                message: "Component vars should have unique names.",
                severity: ERRORSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);

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
                    (a, c -> b) => true;

                }
                constraint c1 {
                    method(a, b -> c) => false;
                    (a, c -> b) => true;
                }
            }`;
            const expectation = {
                message: "Component constraints should have unique names.",
                severity: WARNINGSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);


            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
        it('gets a warning if more then two constraint have the same name property', async () => {
            const documentContent = `component T {
                var a = true, b, c;

                constraint c1 {
                    method(a, b -> c) => true;
                    (a, c -> b) => true;

                }
                constraint c1 {
                    method(a, b -> c) => false;
                    (a, c -> b) => true;

                }
                constraint c1 {
                    method(a, b -> c) => true;
                    (a, c -> b) => true;

                }
            }`;
            const expectation = {
                message: "Component constraints should have unique names.",
                severity: WARNINGSEVERITY
            }
                ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
            expect(diagnostics[1]).toEqual(expect.objectContaining(expectation))

        })
    })
    describe('Range', () => {
        it('variable range', async () => {
            const documentContent = `component T {
                var a = true;
                var b = false;
                var a = true;

                constraint c1 {
                    method(a -> b) => true;
                    (b -> a) => false;
                }
            }`;

            const expectation = {
                range: { 
                    start: { 
                        character: 20,
                        line: 3 
                    }, 
                    end: { 
                        character: 21, 
                        line: 3
                    } 
                }
            };
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);

            expect(diagnostics[0]).toEqual(expect.objectContaining({
                range: expect.objectContaining({
                    start: expectation.range.start, 
                    end: expectation.range.end
                })
            }))
        })
        it('constraint range', async () => {
            const documentContent = `component T {
                var a = true, b, c;

                constraint c1 {
                    method(a, b -> c) => true;
                    (a, c -> b) => true;

                }
                constraint c1 {
                    (a, b -> c) => false;
                    method(a, c -> b) => true;

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
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);

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
                var a = true, b, c;

                var p = 1;
            
                constraint c {
                    method(a, c -> b) => true;
                    m(a, b -> c) => true;
                }
            }`;
            const expectation = [{
                message: "Variable not in use.",
                severity: WARNINGSEVERITY
            }, {
                message: "Able to remove constraint",
                severity: HINTSERVERITY
            }
        ];
            ;
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);

            expect(diagnostics.length).toBe(2)

            expect(diagnostics.pop()).toEqual(expect.objectContaining(expectation.pop()))
        })
        it("shows the waring at the right variable", async () => {
            const documentContent = `component T {
                var a = true, b, c;

                var p = 0;
            
                constraint c {
                    method(a, b -> c) => false;
                    (a, c -> b) => true;

                }
            }`;
            const expectation = {
                message: "Variable not in use.",
                severity: WARNINGSEVERITY,
                range: {
                    end: {
                        character: 21,
                        line: 3,
                    },
                    start: {
                        character: 20,
                        line: 3,
                    },
                }
            };
            
            const doc = await helper(documentContent);
            const diagnostics = await services.validation.DocumentValidator.validateDocument(doc);

            expect(diagnostics[0]).toEqual(expect.objectContaining(expectation))
        })
    })
})