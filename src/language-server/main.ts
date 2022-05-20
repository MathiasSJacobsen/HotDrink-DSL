import { startLanguageServer } from 'langium';
import { addDiagramHandler } from 'langium-sprotty';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { createHotDrinkDslServices } from './hot-drink-dsl-module';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the language services
const services = createHotDrinkDslServices({ connection });

// Start the language server with the language-specific services
startLanguageServer(services.shared);

addDiagramHandler(connection, services.shared);