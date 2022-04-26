import {
    CreateElementAction, CreatingOnDrag, EdgePlacement, ManhattanEdgeRouter, RectangularNode,
    RectangularPort, SEdge, SLabel, SRoutableElement
} from 'sprotty';
import { Action, SEdge as SEdgeSchema } from 'sprotty-protocol';

export class StatesEdge extends SEdge {
    routerKind = ManhattanEdgeRouter.KIND;
    targetAnchorCorrection = Math.sqrt(5);
}

export class StatesEdgeLabel extends SLabel {
    edgePlacement = <EdgePlacement> {
        rotate: true,
        position: 0.6
    };
}

export class StatesNode extends RectangularNode {
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