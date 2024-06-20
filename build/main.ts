import * as path from 'path';
import { ITreeSitterGrammar, ensureWasm } from './compileGrammarWasm';

async function compileWasm(outputPath: string) {
    const treeSitterGrammars: ITreeSitterGrammar[] = [
        {
            name: 'tree-sitter-typescript',
            projectPath: 'tree-sitter-typescript/typescript', // non-standard path
        }
    ];

    for (const grammar of treeSitterGrammars) {
        await ensureWasm(grammar, outputPath);
    }
}

compileWasm(process.argv[2] ?? path.join(path.dirname(__dirname), 'wasm'));
