import { GeneratorContext, LangiumDiagramGenerator } from "langium-sprotty";
import { SModelRoot, SNode, SLabel, SPort, SEdge } from "sprotty-protocol";
import { Component, Model, Variable } from "../language-server/generated/ast";


export class HotDrinkDslDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<Model>): SModelRoot {
        const { document } = args;
        const model = document.parseResult.value;
        console.log(`Generating diagram for ${model}`);
        
        return {
            type: "graph",
            id: "root" ?? "root",
            children: [
                ...model.components.map(component => this.generateNode(component, args)),
                ...model.components.flatMap(component => component.variables.flatMap(vars => vars.vars.map(variable => this.generateEdge(variable, args)))),
            ],
        };
    }
    
    protected generateNode(component: Component, { idCache }: GeneratorContext<Model>): SNode {
        const nodeId = idCache.uniqueId(component.name, component);
        return {
            type: 'node',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: component.name
                },
                <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
                }
            ],
            layout: 'stack',
            layoutOptions: {
                paddingTop: 10.0,
                paddingBottom: 10.0,
                paddingLeft: 10.0,
                paddingRight: 10.0
            }
        };
    }

    protected generateEdge(variable: Variable, { idCache }: GeneratorContext<Model>): SEdge {
        const sourceId = idCache.getId(variable.$container);
        const targetId = idCache.getId(variable);
        const edgeId = idCache.uniqueId(`${sourceId}:${variable.name}:${targetId}`, variable);
        return {
            type: 'edge',
            id: edgeId,
            sourceId: sourceId!,
            targetId: targetId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    text: variable.name,
                }
            ]
        };
    
    }
}