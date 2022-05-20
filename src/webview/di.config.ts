import './css/diagram.css';
import 'sprotty/css/sprotty.css';

import { Container, ContainerModule } from 'inversify';
import {
    configureCommand, configureModelElement, ConsoleLogger, CreateElementCommand, HtmlRoot,
    HtmlRootView, LogLevel, ManhattanEdgeRouter, overrideViewerOptions, PreRenderedElement,
    PreRenderedView, SGraphView, SLabelView, SModelRoot,
    SRoutingHandle, SRoutingHandleView, TYPES, loadDefaultModules, SGraph, SLabel,
    hoverFeedbackFeature, popupFeature, editLabelFeature, labelEditUiModule
} from 'sprotty';
import { CustomRouter } from './custom-edge-router';
import { HotDrinkEdge, ConstraintNode, MethodNode, VariableNode, HotDrinkEdgeWithOpacity, ComponentNode } from './model';
import { ComponentDiamondNodeView, ConstraintCircularNodeView, MethodRectangularNodeView, MyPolylineEdgeView, PolylineArrowEdgeView, VariableRectangularNodeView } from './HotDrinkViews';

const hotDrinkDSLDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
    rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
    rebind(ManhattanEdgeRouter).to(CustomRouter).inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, 'graph', SGraph, SGraphView, {
        enable: [hoverFeedbackFeature, popupFeature]
    });
    configureModelElement(context, 'node:component', ComponentNode, ComponentDiamondNodeView);
    configureModelElement(context, 'node:constraint', ConstraintNode, ConstraintCircularNodeView);
    configureModelElement(context, 'node:method', MethodNode, MethodRectangularNodeView);
    configureModelElement(context, 'node:variable', VariableNode, VariableRectangularNodeView);
    configureModelElement(context, 'label', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'label:xref', SLabel, SLabelView, {
        enable: [editLabelFeature]
    });
    configureModelElement(context, 'edge', HotDrinkEdge, PolylineArrowEdgeView);
    configureModelElement(context, 'edge:constraint:method', HotDrinkEdgeWithOpacity, MyPolylineEdgeView);
    configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
    configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
    configureModelElement(context, 'palette', SModelRoot, HtmlRootView);
    configureModelElement(context, 'routing-point', SRoutingHandle, SRoutingHandleView);
    configureModelElement(context, 'volatile-routing-point', SRoutingHandle, SRoutingHandleView);
    /* configureModelElement(context, 'port', CreateTransitionPort, TriangleButtonView, {
        enable: [popupFeature, creatingOnDragFeature]
    }); */
    configureCommand(context, CreateElementCommand);
});

export function createHotDrinkDSLDiagramContainer(widgetId: string): Container {
    const container = new Container();
    loadDefaultModules(container, { exclude: [ labelEditUiModule ] });
    container.load(hotDrinkDSLDiagramModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: widgetId,
        hiddenDiv: widgetId + '_hidden'
    });
    return container;
}