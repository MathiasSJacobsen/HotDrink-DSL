import fs from "fs";
import { CompositeGeneratorNode, NL, processGeneratorNode } from "langium";
import path from "path";
import { Model } from "../language-server/generated/ast";
import { extractDestinationAndName } from "./cli-util";

export function generateWGraph(
  model: Model,
  filePath: string,
  destination: string | undefined
) {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(
    data.destination,
    model.components[0].name + "Digraph.txt"
  )}`;

  const fileNode = new CompositeGeneratorNode();

  const graph = makeGraph(model);
  const entries = Object.entries(graph);

  fileNode.append(`digraph ${model.components[0].name} {`, NL);

  entries.forEach(([key, value]) => {
    if (value.size !== 0) {
      value.forEach((v) => {
        fileNode.append(`${v} -> ${key};`, NL);
      });
    }
  });

  fileNode.append("}", NL);

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }
  fs.writeFileSync(generatedFilePath, processGeneratorNode(fileNode));
}

function makeGraph(model: Model): Graph {
  const graph: Graph = {};

  model.components.forEach((component) => {
    component.variables.forEach((variables) =>
      variables.vars.forEach((variable) => (graph[variable.name] = new Set()))
    );
    component.constraints.forEach((constraint) =>
      constraint.methods.forEach((method) => {
        const inputVariables = method.signature.inputVariables.map(
          (variable) => variable.ref.ref?.name
        );
        const outputVariables = method.signature.outputVariables.map(
          (variable) => variable.ref.ref?.name
        );
        outputVariables.forEach((outputVariable) => {
          inputVariables.forEach((inputVariable) => {
            if (outputVariable && inputVariable) {
              graph[outputVariable!].add(inputVariable);
            }
          });
        });
      })
    );
  });
  return graph;
}

type Graph = {
  [key: string]: Set<string>;
};
