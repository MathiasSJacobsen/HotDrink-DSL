import { AstNode } from "langium";
import { GeneratorContext, IdCache, LangiumDiagramGenerator } from "langium-sprotty";
import { SModelRoot, SNode, SLabel, SEdge } from "sprotty-protocol";
import { Component, Constraint, isConstraint, isMethod, isVariableReference, Method, Model, Variable } from "../language-server/generated/ast";


const NO_NAME = 'noName';

export class HotDrinkDslDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<Model>): SModelRoot {
        const { document } = args;
        const model = document.parseResult.value;
        console.log(`Generating diagram for ${model.$type}`);

        const constraintNodes = model.components.flatMap(component => component.constraints.map(constraint => this.generateConstraintNode(constraint, args)));
        const methodNodes = model.components.flatMap(component => component.constraints.flatMap(constraint => constraint.methods.map(method => this.generateMethodNode(method, args))));
        const variableNodes = model.components.flatMap(component => component.variables.flatMap(vars => vars.vars.map(variable => this.generateVariableNode(variable, args))))
        const edges = [
            ...model.components.flatMap(component => component.constraints.flatMap(constraint => constraint.methods.map(method => this.generateEdge(method, args)))),
            ...model.components.flatMap(component => component.constraints.flatMap(constraint => constraint.methods.flatMap(method => method.signature.inputVariables.map(variableRef => this.generateEdge(variableRef, args))))),
            ...model.components.flatMap(component => component.constraints.flatMap(constraint => constraint.methods.flatMap(method => method.signature.outputVariables.map(variableRef => this.generateEdge(variableRef, args, true))))),
        ]
        
        

        return {
            type: "graph",
            id: "root" ?? "root",
            children: [
                ...constraintNodes,
                ...methodNodes,
                ...variableNodes,
                ...edges
            ],
        };
    }
    
        protected generateEdge<T extends AstNode>(node: T, { idCache }: GeneratorContext<Model>, _switch?: boolean): SEdge {
            const [sourceId, targetId, edgeType] = this.generateSourceAndTargetIds(node, idCache, _switch);
            console.log(`Adding edge between ${sourceId} and ${targetId}`);
            const edgeId = idCache.uniqueId(`${sourceId}:${targetId}`, node);

    
            return {
                type: edgeType!,
                id: edgeId,
                sourceId: sourceId!,
                targetId: targetId!,
                children: [
                    <SLabel>{
                        type: 'label:xref',
                        id: idCache.uniqueId(edgeId + '.label'),
                        // text: text,
                    }
                ]
            };
        }

        private generateSourceAndTargetIds<T extends AstNode>(node: T, idCache: IdCache<AstNode>, _switch?: boolean): [string | undefined, string | undefined, string] {
            let sourceId: string | undefined;
            let targetId: string | undefined;
            let edgeType: string = 'edge';

            if (isConstraint(node)) {
                sourceId = idCache.getId(node.$container);
                targetId = idCache.getId(node);
            } else if (isMethod(node)) {
                sourceId = idCache.getId(node.$container);
                targetId = idCache.getId(node);
                edgeType = 'edge:constraint:method';
            } else if (isVariableReference(node)) {
                if(_switch){
                    sourceId = idCache.getId(node.$container.$container)?.split(':')[1]; // Den overskriver node id'er når det lages en edge mellom; id til constraint bli component:constraint isteden for constraint 
                    targetId = idCache.getId(node.ref.ref);
                } else {
                    targetId = idCache.getId(node.$container.$container)?.split(':')[1]; // samme som over
                    sourceId = idCache.getId(node.ref.ref);
                }
            }
            
            return [sourceId, targetId, edgeType];
        }

    protected generateConstraintNode(constraint: Constraint, { idCache }: GeneratorContext<Model>): SNode {
        const name = constraint.name ? constraint.$container.name + '.' + constraint.name : constraint.$container.name + '.' + NO_NAME;
        const nodeId = idCache.uniqueId(name, constraint);
        console.log(`Adding constraint node ${nodeId}`);
        return {
            type: 'node:constraint',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: name
                },/* 
                <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
                } */
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

    protected generateMethodNode(method: Method, { idCache }: GeneratorContext<Model>): SNode {
        const name = method.name || NO_NAME;
        const nodeId = idCache.uniqueId(name, method);
        console.log(`Adding method node ${nodeId}`);
        return {
            type: 'node:method',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: name
                },
                /*
                <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
                }
                */
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
    
    protected generateVariableNode(variable: Variable, { idCache }: GeneratorContext<Model>): SNode {
        const nodeId = idCache.uniqueId(variable.name, variable);
        console.log(`Adding variable node ${nodeId}`)
        return {
            type: 'node:variable',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: variable.name
                },
                /* <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
                } */
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
    
    protected generateComponentNode(component: Component, { idCache }: GeneratorContext<Model>): SNode {
        const nodeId = idCache.uniqueId(component.name, component);
        console.log(`Adding component node ${nodeId}`)
        return {
            type: 'node:component',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: component.name
                },
                /* <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
                } */
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
}