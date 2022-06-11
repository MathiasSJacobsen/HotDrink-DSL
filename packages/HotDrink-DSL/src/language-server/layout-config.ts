import { LayoutOptions } from 'elkjs';
import { DefaultLayoutConfigurator } from 'sprotty-elk/lib/elk-layout';
import { SGraph, SModelIndex, SNode, SPort } from 'sprotty-protocol';

export class HotDrinkDSLLayoutConfigurator extends DefaultLayoutConfigurator {

    protected graphOptions(sgraph: SGraph, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.direction': 'DOWN',
            'org.eclipse.elk.spacing.nodeNode': '30.0',
            'org.eclipse.elk.layered.spacing.edgeNodeBetweenLayers': '30.0'
        };
    }

    protected nodeOptions(snode: SNode, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.portAlignment.default': 'CENTER',
            'org.eclipse.elk.portConstraints': 'FIXED_SIDE'
        };
    }

    protected portOptions(sport: SPort, index: SModelIndex): LayoutOptions {
        return {
            'org.eclipse.elk.port.side': 'EAST',
            'org.eclipse.elk.port.borderOffset': '3.0'
        };
    }

}