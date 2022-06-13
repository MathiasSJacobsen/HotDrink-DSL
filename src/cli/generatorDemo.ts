import fs from "fs";
import { CompositeGeneratorNode, processGeneratorNode } from "langium";
import path from "path";
import { Model } from "../language-server/generated/ast";
import { extractDestinationAndName } from "./cli-util";
import { generateComponent } from "./generatorJavaScript";

export function generateHTMLdemo(
    model: Model,
    filePath: string,
    destination: string | undefined
): [string, string] {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePathJavaScript = `${path.join(data.destination, data.name)}Demo.js`;
    const generatedFilePathHTML = `${path.join(data.destination, data.name)}Demo.html`;

    const fileNodeJavaScript = new CompositeGeneratorNode();
    const fileNodeHTML = new CompositeGeneratorNode();

    generateHTML(fileNodeHTML, data.name);

    generateComponent(model.components, fileNodeJavaScript);
    
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePathHTML, processGeneratorNode(fileNodeHTML));
    fs.writeFileSync(generatedFilePathJavaScript, processGeneratorNode(fileNodeJavaScript));
    return [generatedFilePathJavaScript, generatedFilePathHTML];
}

function generateHTML(fileNode: CompositeGeneratorNode, javascriptFileName: string) {
    fileNode.append(`
    <html>
<head>
    <meta charset="UTF-8">
    <title>HotDrinkDemoApp</title>
    <script type="text/javascript" src="./hotdrink.js"></script>
    <script type="module" src="./${javascriptFileName}.js"></script>
</head>

<body>
<h1>
    Convert between celcius and fahrenheit
</h1>
<tbody>
    <table>
        <tr>
        <td>Celcius:</td>
        <td><input type="number" id="celcius"></td>
        <td>Fahrenheit:</td>
        <td><input  id="fahrenheit"></td>
    </tr>
</table>
</tbody>
</body>

</html>
    `)
}
/*
function generateBinders(fileNode:CompositeGeneratorNode) {

}
*/