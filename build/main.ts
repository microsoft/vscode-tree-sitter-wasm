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
            name: 'tree-sitter-c-sharp',
            filename: 'tree-sitter-c_sharp.wasm' // non-standard filename
        },
        {
            name: 'tree-sitter-cpp',
        },
        {
            name: 'tree-sitter-go',
        },
        {
            name: 'tree-sitter-java',
        },
        {
            name: 'tree-sitter-javascript', // Also includes jsx support
        },
        {
            name: 'tree-sitter-python',
        },
        {
            name: 'tree-sitter-regex',
        },
        {
            name: 'tree-sitter-ruby',
        },
        {
            name: 'tree-sitter-rust',
        },
        {
            name: 'tree-sitter-tsx',
            projectPath: 'tree-sitter-typescript/tsx', // non-standard path
        },
        {
            name: 'tree-sitter-typescript',
            projectPath: 'tree-sitter-typescript/typescript', // non-standard path
        },
        {
            name: 'tree-sitter-php',
            projectPath: 'tree-sitter-php/php', // non-standard path
        },

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
