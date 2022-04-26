import './css/diagram.css';
import 'sprotty/css/sprotty.css';

import { Container, ContainerModule } from 'inversify';
import {
    configureCommand, configureModelElement, ConsoleLogger, CreateElementCommand, HtmlRoot,
    HtmlRootView, LogLevel, ManhattanEdgeRouter, overrideViewerOptions, PreRenderedElement,
    PreRenderedView, RectangularNodeView, SGraphView, SLabelView, SModelRoot,
    SRoutingHandle, SRoutingHandleView, TYPES, loadDefaultModules, SGraph, SLabel,
    hoverFeedbackFeature, popupFeature, creatingOnDragFeature, editLabelFeature, labelEditUiModule
} from 'sprotty';
import { CustomRouter } from './custom-edge-router';
import { CreateTransitionPort, StatesEdge, StatesNode } from './model';
import { PolylineArrowEdgeView, TriangleButtonView } from './views';

const statesDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    rebind(ManhattanEdgeRouter).to(CustomRouter).inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, 'graph', SGraph, SGraphView, {
        enable: [hoverFeedbackFeature, popupFeature]
    });
    configureModelElement(context, 'node', StatesNode, RectangularNodeView);
    configureModelElement(context, 'label', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:xref', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'edge', StatesEdge, PolylineArrowEdgeView);
    configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
    configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
    configureModelElement(context, 'palette', SModelRoot, HtmlRootView);
    configureModelElement(context, 'routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, 'volatile-routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, 'port', CreateTransitionPort, TriangleButtonView, {
        enable: [popupFeature, creatingOnDragFeature]
    });
    configureCommand(context, CreateElementCommand);
});

export function createStateDiagramContainer(widgetId: string): Container {
    const container = new Container();
    loadDefaultModules(container, { exclude: [ labelEditUiModule ] });
    container.load(statesDiagramModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden'
    });
    return container;
}