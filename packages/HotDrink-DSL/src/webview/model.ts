import {
    CreateElementAction, CreatingOnDrag, EdgePlacement, ManhattanEdgeRouter, RectangularNode,
    DiamondNode, CircularNode,
    RectangularPort, SEdge, SLabel, SRoutableElement
} from 'sprotty';
import { Action, SEdge as SEdgeSchema } from 'sprotty-protocol';

export class HotDrinkEdge extends SEdge {
    routerKind = ManhattanEdgeRouter.KIND;
    targetAnchorCorrection = Math.sqrt(5);
}

export class HotDrinkEdgeWithOpacity extends SEdge {
    routerKind = ManhattanEdgeRouter.KIND;
    targetAnchorCorrection = Math.sqrt(5);
    opacity: number = 0.4;
}


export class HotDrinkEdgeLabel extends SLabel {
    edgePlacement = <EdgePlacement> {
        rotate: true,
        position: 0.6
    };
}

export class ComponentNode extends DiamondNode {
    canConnect(routable: SRoutableElement, role: string) {
        return true;
    }
}

export class ConstraintNode extends CircularNode {
    canConnect(routable: SRoutableElement, role: string) {
        return true;
    }
}

export class MethodNode extends RectangularNode {
    canConnect(routable: SRoutableElement, role: string) {
        return true;
    }
}

export class VariableNode extends RectangularNode {
    canConnect(routable: SRoutableElement, role: string) {
        return true;
    }
}

export class CreateTransitionPort extends RectangularPort implements CreatingOnDrag {
    createAction(id: string): Action {
        const edge: SEdgeSchema = {
            id,
            type: 'edge',
            sourceId: this.parent.id,
            targetId: this.id
        };
        return CreateElementAction.create(edge, { containerId: this.root.id });
    }
}