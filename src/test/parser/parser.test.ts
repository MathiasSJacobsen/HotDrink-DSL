import { parseHelper } from "langium/lib/test";
import { Model } from "../../language-server/generated/ast";
import { createHotDrinkDslServices } from "../../language-server/hot-drink-dsl-module";

describe('Parser test', () => {
    it("Parses the invoice hotdrink code", async () => {
        const grammarServices = createHotDrinkDslServices()

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

        const grammar = (await parseHelper<Model>(grammarServices)(text)).document.parseResult.parserErrors;
        expect(grammar.length).toBe(0)
    })
})