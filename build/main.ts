/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs/promises'
import { ITreeSitterGrammar, ensureWasm, type ITreeSitterPrebuildWasm } from './compileGrammarWasm';
import { ensureTreeSitterWasm } from './compileTreeSitterWasm';

async function compileGrammarWasm(outputPath: string) {
    const treeSitterGrammars: ITreeSitterGrammar[] = [
        {
            name: 'tree-sitter-css'
        },
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
            name: 'tree-sitter-ini',
            git: {
                repo: 'https://github.com/justinmk/tree-sitter-ini',
                sha: '962568c9efa71d25720ab42c5d36e222626ef3a6'
            }
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
        }
    ];

    for (const grammar of treeSitterGrammars) {
        await ensureWasm(grammar, outputPath);
    }
}

async function copyPrebuildWasm(outputPath: string) {
    const treeSitterGrammars: ITreeSitterPrebuildWasm[] = [
        {
            name: 'tree-sitter-php',
        }
    ];

    for (const grammar of treeSitterGrammars) {
        const wasmName = grammar.filename ?? `${grammar.name}.wasm`;
        console.log(`Copying prebuild wasm ${wasmName}`);
        const filename = path.join(root, 'node_modules', grammar.name, wasmName);
        await fs.cp(filename, path.join(outputPath, wasmName));
    }
}

function compileTreeSitterWasm(clonePath: string, outputPath: string) {
    const tag = 'v0.25.2';
    const repo = 'https://github.com/tree-sitter/tree-sitter';
    ensureTreeSitterWasm(repo, tag, clonePath, outputPath);
}

const root = path.dirname(__dirname);
const baseOutput = process.argv[2] ?? path.join(path.dirname(__dirname))
const wasmOutput = path.join(baseOutput, 'wasm');

async function main() {
    await copyPrebuildWasm(wasmOutput);
    await compileGrammarWasm(wasmOutput);
    compileTreeSitterWasm(baseOutput, wasmOutput);
}

main().catch(err => {
    console.log(err);
    process.exitCode = -1;
});
