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
            git: {
                repo: 'https://github.com/tree-sitter/tree-sitter-c-sharp',
                sha: '485f0bae0274ac9114797fc10db6f7034e4086e3'
            },
            filename: 'tree-sitter-c_sharp.wasm' // non-standard filename
        },
        {
            name: 'tree-sitter-cpp',
            git: {
                repo: 'https://github.com/tree-sitter/tree-sitter-cpp',
                sha: '12bd6f7e96080d2e70ec51d4068f2f66120dde35'
            }
        },
        {
            name: 'tree-sitter-go',
        },
        {
            name: 'tree-sitter-ini',
            git: {
                repo: 'https://github.com/justinmk/tree-sitter-ini',
                sha: '0eaed8040513e62ee2e9e8db9f086cf630a524eb'
            }
        },
        {
            name: 'tree-sitter-java',
        },
        {
            name: 'tree-sitter-javascript', // Also includes jsx support
        },
        {
            name: 'tree-sitter-php',
            projectPath: 'tree-sitter-php/php', // non-standard path
        },
        {
            name: 'tree-sitter-powershell',
            git: {
                repo: 'https://github.com/airbus-cert/tree-sitter-powershell',
                sha: '9379c77984af1f3d3d7e3cc5e897de3496725280'
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
            git: {
                repo: 'https://github.com/tree-sitter/tree-sitter-rust',
                sha: '261b20226c04ef601adbdf185a800512a5f66291'
            }
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


function compileTreeSitterWasm(clonePath: string, outputPath: string) {
    const tag = 'v0.25.10';
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
