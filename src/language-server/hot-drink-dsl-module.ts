import { createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject, LangiumServices, LangiumSharedServices, Module, PartialLangiumServices } from 'langium';
import { HotDrinkDslGeneratedModule, HotDrinkDslGeneratedSharedModule } from './generated/module';
import { HotDrinkDslActionProvider } from './hot-drink-dsl-code-actions';
import { HotDrinkDslScopeProvider } from './hot-drink-dsl-scope';
import { HotDrinkDslValidationRegistry, HotDrinkDslValidator } from './hot-drink-dsl-validator';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type HotDrinkDslAddedServices = {
    validation: {
        HotDrinkDslValidator: HotDrinkDslValidator
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
export const HotDrinkDslModule: Module<HotDrinkDslServices, PartialLangiumServices & HotDrinkDslAddedServices> = {
    lsp: {
        CodeActionProvider: () => new HotDrinkDslActionProvider(),
    },
    validation: {
        ValidationRegistry: (injector) => new HotDrinkDslValidationRegistry(injector),
        HotDrinkDslValidator: () => new HotDrinkDslValidator()
    },
    references : {
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
    shared: LangiumSharedServices,
    hotdrinkDSL: HotDrinkDslServices
} {

    const shared = inject(
        createDefaultSharedModule(context),
        HotDrinkDslGeneratedSharedModule
    )

    const hotdrinkDSL = inject(
        createDefaultModule({ shared }),
        HotDrinkDslGeneratedModule,
        HotDrinkDslModule
    );
    shared.ServiceRegistry.register(hotdrinkDSL)
    return { shared, hotdrinkDSL };
}


