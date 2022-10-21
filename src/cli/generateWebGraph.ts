//import { CompositeGeneratorNode } from "langium";
//import path from "path";
import { Model } from "../language-server/generated/ast";
//import { extractDestinationAndName } from "./cli-util";

export function generateWGraph(
  model: Model,
  filePath: string,
  destination: string | undefined
) {
  //const data = extractDestinationAndName(filePath, destination);
  // const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

  // const fileNode = new CompositeGeneratorNode();

  const graph: any = {};

  model.components.forEach((component) =>
    component.variables.forEach((variables) =>
      variables.vars.forEach((variable) => (graph[variable.name] = new Set()))
    )
  );

  model.components.forEach((component) =>
    component.constraints.forEach((constraint) =>
      constraint.methods.forEach((method) => {
        const inp = method.signature.inputVariables.map((v) => v.ref.ref?.name);
        const outp = method.signature.outputVariables.map(
          (v) => v.ref.ref?.name
        );
        outp.forEach((outputVariable) => {
          inp.forEach((inputVariable) => {
            graph[outputVariable!].add(inputVariable);
          });
        });
      })
    )
  );
  console.log(graph);
}
