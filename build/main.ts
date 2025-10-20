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
            name: 'tree-sitter-bash'
        },
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
            name: 'tree-sitter-powershell',
            git: {
                repo: 'https://github.com/airbus-cert/tree-sitter-powershell',
                sha: 'ebe2ab2f642eda2072c68c8de02e83973c26f33c'
            }
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
        }
    ];

    for (const grammar of treeSitterGrammars) {
        await ensureWasm(grammar, outputPath);
    }
}


function compileTreeSitterWasm(clonePath: string, outputPath: string) {
    const tag = 'v0.25.2';
    const repo = 'https://github.com/tree-sitter/tree-sitter';
    ensureTreeSitterWasm(repo, tag, clonePath, outputPath);
}

const baseOutput = process.argv[2] ?? path.join(path.dirname(__dirname))
const wasmOutput = path.join(baseOutput, 'wasm');

async function main() {
    await compileGrammarWasm(wasmOutput);
    compileTreeSitterWasm(baseOutput, wasmOutput);
}

main().catch(err => {
    console.log(err);
    process.exitCode = -1;
});
