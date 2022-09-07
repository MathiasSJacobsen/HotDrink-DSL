import fs from "fs";
import * as vscode from "vscode";
import { CompositeGeneratorNode, processGeneratorNode } from "langium";
import path from "path";
import { Component, Model } from "../language-server/generated/ast";
import { extractDestinationAndName } from "./cli-util";
import { generateComponent } from "./generatorJavaScript";

export function generateHTMLdemo(
    model: Model,
    filePath: string,
    destination: string | undefined
): {
    generatedFilePathJavaScript: string,
    generatedFilePathHTML: string,
    binderPath: string,
} | undefined {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePathJavaScript = `${path.join(data.destination, data.name)}Demo.js`;
    const generatedFilePathHTML = `${path.join(data.destination, data.name)}Demo.html`;
    const binderPath = `${path.join(data.destination, "binders")}.js`;
    const magicPath = `${path.join(data.destination, "magic")}.js`;


    const fileNodeJavaScript = new CompositeGeneratorNode();
    const fileNodeHTML = new CompositeGeneratorNode();
    const fileNodeBinders = new CompositeGeneratorNode();
    const fileNodeMagic = new CompositeGeneratorNode();

    const HTMLGenerated = generateHTML(fileNodeHTML, data.name, model.components);
    if(!HTMLGenerated) return;

    generateComponent(model.components, fileNodeJavaScript, true);

    generateBinders(fileNodeBinders);

    generateMagic(fileNodeMagic, model.components, data.name);


    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePathHTML, processGeneratorNode(fileNodeHTML));
    fs.writeFileSync(generatedFilePathJavaScript, processGeneratorNode(fileNodeJavaScript));
    fs.writeFileSync(binderPath, processGeneratorNode(fileNodeBinders));
    fs.writeFileSync(magicPath, processGeneratorNode(fileNodeMagic));
    return {generatedFilePathJavaScript, generatedFilePathHTML, binderPath}
}

function generateHTML(fileNode: CompositeGeneratorNode, javascriptFileName: string, components: Component[]) {
    let noneType;
    components.map(components => components.variables.map(variable => variable.vars.map(v => {

        
        
        if (!v.type) {
            vscode.window.showErrorMessage("All variables need types for this command to work, file was made but it is missing type on input field.");
            noneType = true;
            return;
        }
    })));
    if(noneType) return;
    fileNode.append(`
    <html>
<head>
    <meta charset="UTF-8">
    <title>HotDrinkDemoApp</title>
    <script type="text/javascript" src="./hotdrink.js"></script>
    <script type="module" src="./magic.js"></script>
</head>

<body>
<h1>
    Convert between celcius and fahrenheit
</h1>
<tbody>
    <table>
${components.map(components => components.variables.map(variable => variable.vars.map(v => {
    console.log(v.type);
    
    if (!v.type) vscode.window.showErrorMessage("All variables need types for this command to work, file was made but it is missing type on input field.");
    return '        <tr><td>' + v.name + ':</td>\n        <td><input type="' + v.type + '" id="' + v.name + '"></td></tr>\n'

    }).join("")).join(""))}
    
</table>
</tbody>
</body> 

</html>
    `)
    return true;
}

function generateBinders(fileNode: CompositeGeneratorNode) {
    fileNode.append(`
    function binder(element, value, type) {
        value.value.subscribe({
            next: val => {
                if (val.hasOwnProperty('value')) {
                    element[type] = val.value;
                }
            }
        });
        element.addEventListener('input', () => {
            value.value.set(element[type]);
        });
    }

    export function valueBinder(element, value) {
        binder(element, value, "value");
    }

    export function innerTextBinder(text, value) {
        value.value.subscribe({
            next: val => {
                if (val.hasOwnProperty('value')) {
                    text.innerText = value.value.value;
                }
            }
        })
    }
    `)
}

function generateMagic(fileNode: CompositeGeneratorNode, components: Component[], javascriptPath: string) {
    
    fileNode.append(`
        import { valueBinder } from "./binders.js";
        import { ${components.map(comp => {return comp.name})} } from "./${javascriptPath}Demo.js";

        const system = new hd.ConstraintSystem();

        window.onload = () => {
${components.map(comp => {return "            system.addComponent("+ comp.name +");\n            " + comp.variables.map(variable => variable.vars.map(v => {return "            valueBinder(document.getElementById('" + v.name + "'), "+ comp.name +".vs." + v.name + ");\n";}).join("")).join("")})}
            system.update();
            /* 
${components.map(components => components.variables.map(variable => variable.vars.map(v => {
                return "            valueBinder(document.getElementById('" + v.name + "'), comp.vs." + v.name + ");\n";
            }).join("")).join(""))
        } */
    }
    `)
}
