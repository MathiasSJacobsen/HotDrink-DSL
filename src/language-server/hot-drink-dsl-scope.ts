import {
  AstNode,
  AstNodeDescriptionProvider,
  DefaultScopeProvider,
  getContainerOfType,
  getDocument,
  LangiumServices,
  Scope,
  SimpleScope,
  stream,
} from "langium";
import { isComponent, isMethod, isModel } from "./generated/ast";

export class HotDrinkDslScopeProvider extends DefaultScopeProvider {
  descriptionProvider: AstNodeDescriptionProvider;

  constructor(services: LangiumServices) {
    super(services);
    this.descriptionProvider = services.index.AstNodeDescriptionProvider;
  }

  getScope(node: AstNode, referenceId: string): Scope {
    if (referenceId === "VariableReference:ref") {
      const componentNode = getContainerOfType(node, isComponent);
      const descriptions = componentNode!.variables
        .flatMap((v) => v.vars)
        .map((v) =>
          this.descriptionProvider.createDescription(v, v.name, getDocument(v))
        );
      return new SimpleScope(stream(descriptions));
    }

    if (referenceId === "FunctionCall:funcRef") {
      const modelNode = getContainerOfType(node, isModel);
      const descriptions = modelNode!.imports
        .flatMap((i) => i.imports)
        .map((v) => {
          if(v.altName) {
            return this.descriptionProvider.createDescription(v, v.altName.name, getDocument(v))
          }
          return this.descriptionProvider.createDescription(v, v.function.name, getDocument(v))
        });
      return new SimpleScope(stream(descriptions));
    }

    if (referenceId === "FunctionCall:args") {
      const methodNode = getContainerOfType(node, isMethod);
      const descriptions = methodNode!.signature.inputVariables
        .map((v) => v.ref.ref)
        .map((v) =>
          this.descriptionProvider.createDescription(
            v!,
            v!.name,
            getDocument(v!)
          )
        );
      return new SimpleScope(stream(descriptions));
    }
    if (referenceId === "Atomic:value") {
      const methodNode = getContainerOfType(node, isMethod);
      const descriptions = methodNode!.signature.inputVariables
        .map((v) => v.ref.ref)
        .map((v) =>
          this.descriptionProvider.createDescription(
            v!,
            v!.name,
            getDocument(v!)
          )
        );
      return new SimpleScope(stream(descriptions));
    }
    
    if (referenceId === "VarRef:value") {
      const methodNode = getContainerOfType(node, isMethod);
      const descriptions = methodNode!.signature.inputVariables
        .map((v) => v.ref.ref)
        .map((v) =>
          this.descriptionProvider.createDescription(
            v!,
            v!.name,
            getDocument(v!)
          )
        );
      return new SimpleScope(stream(descriptions));
    }

    return super.getScope(node, referenceId);
  }
}
