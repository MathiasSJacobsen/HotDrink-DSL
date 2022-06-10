import { parseHelper } from "langium/lib/test";
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";

const grammarServices = createHotDrinkDslServices().hotdrinkDSL

describe('Parser test', () => {
    it("Parses the invoice hotdrink code", async () => {

        const text = `
        import { func1, func2, func3 } from 'filethatdonstexist.js'
        
        component invoiceCalc {
            var income = 500000, percentage = 30, time = 12, finnmark = false, deduction, tax, net_income;
            
            constraint {
                (income, percentage, deduction -> tax, net_income) => func1(income, percentage, deduction);
                (tax, net_income, deduction, percentage -> income) => func2(tax, net_income, deduction, percentage);
            }
            
            constraint {
                (finnmark, time -> deduction) => func3(finnmark, time); 
            }
        }
        `;

        const grammar = (await parseHelper<Model>(grammarServices)(text)).parseResult.parserErrors;
        expect(grammar.length).toBe(0);
    });
    it('Parses negation', async () => {
        const text = `
        component negation {
            var a = -1, b;
        
            constraint c1 {
                (a -> b) => 2*a;
            }
        } 
        `;

        const grammar = (await parseHelper<Model>(grammarServices)(text)).parseResult.parserErrors;
        expect(grammar.length).toBe(0);
    })
})