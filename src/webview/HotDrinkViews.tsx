/** @jsx svg */
import { svg } from 'sprotty/lib/lib/jsx';

import { VNode } from "snabbdom";
import { IViewArgs, RenderingContext } from "sprotty/lib/base/views/view";
import { SNode, SPort } from "sprotty/lib/graph/sgraph";
import { Point } from 'sprotty-protocol/lib/utils/geometry';
import { SShapeElement } from 'sprotty/lib/features/bounds/model';
import { ShapeView } from 'sprotty/lib/features/bounds/views';
import { Hoverable } from 'sprotty/lib/features/hover/model';
import { Selectable } from 'sprotty/lib/features/select/model';
import { Diamond } from 'sprotty/lib/utils/geometry';
import { injectable } from 'inversify';


@injectable()
export class ComponentDiamondNodeView extends ShapeView {
    render(node: Readonly<SShapeElement & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        const diamond = new Diamond({ height: Math.max(node.size.height, 0), width: Math.max(node.size.width, 0), x: 0, y: 0 });
        const points = `${svgStr(diamond.topPoint)} ${svgStr(diamond.rightPoint)} ${svgStr(diamond.bottomPoint)} ${svgStr(diamond.leftPoint)}`;
        return <g>
            <polygon id="component" class-sprotty-node={node instanceof SNode} class-sprotty-port={node instanceof SPort}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  points={points} />
            {context.renderChildren(node)}
        </g>;
    }
}

function svgStr(point: Point) {
    return `${point.x},${point.y}`;
}

@injectable()
export class ConstraintCircularNodeView extends ShapeView {
    render(node: Readonly<SShapeElement & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        /* const radius = this.getRadius(node);
        return <g>
            <circle id="constraint" class-sprotty-node={node instanceof SNode} class-sprotty-port={node instanceof SPort}
                    class-mouseover={node.hoverFeedback} class-selected={node.selected}
                    r={radius} cx={radius} cy={radius}></circle>
            {context.renderChildren(node)}
        </g>;
         */
        return <g>
            <rect id="constraint" class-sprotty-node={node instanceof SNode} class-sprotty-port={node instanceof SPort}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }

    protected getRadius(node: SShapeElement): number {
        const d = Math.min(node.size.width, node.size.height);
        return d > 0 ? d / 2 : 0;
    }
}
@injectable()
export class MethodRectangularNodeView extends ShapeView {
    render(node: Readonly<SShapeElement & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect id="method" class-sprotty-node={node instanceof SNode} class-sprotty-port={node instanceof SPort}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class VariableRectangularNodeView extends ShapeView {
    render(node: Readonly<SShapeElement & Hoverable & Selectable>, context: RenderingContext, args?: IViewArgs): VNode | undefined {
        if (!this.isVisible(node, context)) {
            return undefined;
        }
        return <g>
            <rect id="variable" class-sprotty-node={node instanceof SNode} class-sprotty-port={node instanceof SPort}
                  class-mouseover={node.hoverFeedback} class-selected={node.selected}
                  x="0" y="0" width={Math.max(node.size.width, 0)} height={Math.max(node.size.height, 0)}></rect>
            {context.renderChildren(node)}
        </g>;
    }
}