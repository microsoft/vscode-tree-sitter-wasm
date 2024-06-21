import * as path from 'path';
import { ITreeSitterGrammar, ensureWasm } from './compileGrammarWasm';
import { ensureTreeSitterWasm } from './compileTreeSitterWasm';

async function compileGrammarWasm(outputPath: string) {
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

async function compileTreeSitterWasm(clonePath: string,outputPath: string) {
    const tag = 'v0.22.2';
    const repo = 'https://github.com/tree-sitter/tree-sitter';
    ensureTreeSitterWasm(repo, tag, clonePath, outputPath);
}

const baseOutput = process.argv[2] ?? path.join(path.dirname(__dirname))
const wasmOutput = path.join(baseOutput, 'wasm');
compileGrammarWasm(wasmOutput);
compileTreeSitterWasm(baseOutput, wasmOutput);
