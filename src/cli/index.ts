import colors from 'colors';
import { Command } from 'commander';
import { HotDrinkDslLanguageMetaData } from '../language-server/generated/module';
import { Model } from '../language-server/generated/ast';
import { createHotDrinkDslServices } from '../language-server/hot-drink-dsl-module';
import { extractAstNode } from './cli-util';

import { window } from 'vscode';
import { generateJavaScriptFile } from './generatorJavaScript';
import { generateHTMLdemo } from './generatorDemo';
import { ERRORSEVERITY } from '../__test__/test-utils';
import { generateWGraph } from './generateWebGraph';

export const generateJavaScript = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createHotDrinkDslServices().hotdrinkDSL
    const model = await extractAstNode<Model>(fileName, HotDrinkDslLanguageMetaData.fileExtensions, services);
    if (modelHasErrors(model)) {
        window.showErrorMessage(`There is a error in the model. Please fix it before generating the code.`);
        return
    }
    const generatedFilePath = generateJavaScriptFile(model, fileName, opts.destination);
    console.log(colors.green(`JavaScript code generated successfully: ${generatedFilePath}`));
    window.showInformationMessage(`JavaScript code generated successfully: ${generatedFilePath}`)
};

export const generateDemo = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createHotDrinkDslServices().hotdrinkDSL;
    const model = await extractAstNode<Model>(fileName, HotDrinkDslLanguageMetaData.fileExtensions, services);
    if (modelHasErrors(model)) {
        window.showErrorMessage(`There is a error in the model. Please fix it before generating the code.`);
        return
    }
    const t = generateHTMLdemo(model, fileName, opts.destination);
    if (t) {
        window.showInformationMessage(`Code generated successfully: ${t.generatedFilePathJavaScript} & ${t.generatedFilePathHTML} & ${t.binderPath}`);
    }
};

export const generateWebGraph = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createHotDrinkDslServices().hotdrinkDSL;
    const model = await extractAstNode<Model>(fileName, HotDrinkDslLanguageMetaData.fileExtensions, services);
    if (modelHasErrors(model)) {
        window.showErrorMessage(`There is a error in the model. Please fix it before generating the code.`);
        return
    }
    if (model.components.length !== 1) {
        window.showErrorMessage(`Can only make graph for one component. Please fix it before generating the code.`);
        return
    }
    generateWGraph(model, fileName, opts.destination);
};

function modelHasErrors(model:Model) {
    return model.$document?.diagnostics?.filter(d => d.severity === ERRORSEVERITY).length !== 0
}

export type GenerateOptions = {
    destination?: string;
}

export default function(): void {
    const program = new Command();

    program
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .version(require('../../package.json').version);

    program
        .command('generate')
        .argument('<file>', `possible file extensions: ${HotDrinkDslLanguageMetaData.fileExtensions.join(', ')}`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates JavaScript code that prints "Hello, {name}!" for each greeting in a source file')
        .action(generateJavaScript);

    program.parse(process.argv);
}
