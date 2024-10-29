/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { ITreeSitterGrammar, ensureWasm } from './compileGrammarWasm';
import { ensureTreeSitterWasm } from './compileTreeSitterWasm';

async function compileGrammarWasm(outputPath: string) {
    const treeSitterGrammars: ITreeSitterGrammar[] = [
        {
            name: 'tree-sitter-typescript',
            projectPath: 'tree-sitter-typescript/typescript', // non-standard path
        },
        {
            name: 'tree-sitter-regex',
        }
    ];

    for (const grammar of treeSitterGrammars) {
        await ensureWasm(grammar, outputPath);
    }
}

function compileTreeSitterWasm(clonePath: string,outputPath: string) {
    const tag = 'v0.23.0';
    const repo = 'https://github.com/tree-sitter/tree-sitter';
    ensureTreeSitterWasm(repo, tag, clonePath, outputPath);
}

const baseOutput = process.argv[2] ?? path.join(path.dirname(__dirname))
const wasmOutput = path.join(baseOutput, 'wasm');
compileGrammarWasm(wasmOutput);
compileTreeSitterWasm(baseOutput, wasmOutput);
