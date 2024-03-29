import ElkConstructor from 'elkjs/lib/elk.bundled';
import { DefaultElementFilter, ElkFactory, ElkLayoutEngine, IElementFilter, ILayoutConfigurator } from 'sprotty-elk/lib/elk-layout';
import { createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject, LangiumServices, Module, PartialLangiumServices } from 'langium';
import { LangiumSprottySharedServices, SprottyDiagramServices, SprottySharedModule } from 'langium-sprotty';
import { HotDrinkDslDiagramGenerator } from '../sprotty/diagram-generator';
import { HotDrinkDslGeneratedModule, HotDrinkDslGeneratedSharedModule } from './generated/module';
import { HotDrinkDslActionProvider } from './hot-drink-dsl-code-actions';
import { HotDrinkDslScopeProvider } from './hot-drink-dsl-scope';
import { HotDrinkDslValidationRegistry, HotDrinkDslValidator } from './hot-drink-dsl-validator';
import { HotDrinkDSLLayoutConfigurator } from "./layout-config";

/**
 * Declaration of custom services - add your own service classes here.
 */
export type HotDrinkDslAddedServices = {
    validation: {
        HotDrinkDslValidator: HotDrinkDslValidator
    },
    layout: {
        ElkFactory: ElkFactory,
        ElementFilter: IElementFilter,
        LayoutConfigurator: ILayoutConfigurator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type HotDrinkDslServices = LangiumServices & HotDrinkDslAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const HotDrinkDslModule: Module<HotDrinkDslServices, PartialLangiumServices & HotDrinkDslAddedServices & SprottyDiagramServices> = {
    diagram: {
        DiagramGenerator: (services) => new HotDrinkDslDiagramGenerator(services),
        ModelLayoutEngine: (services) => new ElkLayoutEngine(services.layout.ElkFactory, services.layout.ElementFilter, services.layout.LayoutConfigurator),
    },
    layout: {
        ElkFactory: () => () => new ElkConstructor({ algorithms: ['layered'] }),
        ElementFilter: () => new DefaultElementFilter,
        LayoutConfigurator: () => new HotDrinkDSLLayoutConfigurator
    },
    lsp: {
        CodeActionProvider: () => new HotDrinkDslActionProvider(),
    },
    validation: {
        ValidationRegistry: (injector) => new HotDrinkDslValidationRegistry(injector),
        HotDrinkDslValidator: () => new HotDrinkDslValidator()
    },
    references: {
        ScopeProvider: (services) => new HotDrinkDslScopeProvider(services),
    }

};

/**
 * Inject the full set of language services by merging three modules:
 *  - Langium default services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 */
export function createHotDrinkDslServices(context?: DefaultSharedModuleContext): {
    shared: LangiumSprottySharedServices,
    hotdrinkDSL: HotDrinkDslServices
} {

    const shared = inject(
        createDefaultSharedModule(context),
        HotDrinkDslGeneratedSharedModule,
        SprottySharedModule
    )

    const hotdrinkDSL = inject(
        createDefaultModule({ shared }),
        HotDrinkDslGeneratedModule,
        HotDrinkDslModule
    );
    shared.ServiceRegistry.register(hotdrinkDSL)
    return { shared, hotdrinkDSL };
}


