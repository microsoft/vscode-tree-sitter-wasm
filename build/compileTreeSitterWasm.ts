/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export function ensureTreeSitterWasm(repo: string, tag: string, clonePath: string, outputPath: string) {
    const repoSubpath = 'tree-sitter';
    try {
        fs.rmSync(path.join(clonePath, repoSubpath), { recursive: true });
    } catch (e) {
        // Ignore.
    }
    const command = `git clone --branch ${tag} ${repo} ${repoSubpath} --depth 1 --single-branch --no-tags`;
    console.log(`Executing: ${command}`);
    child_process.execSync(command, {
        stdio: 'inherit',
        cwd: clonePath,
        encoding: 'utf8'
    });

    const treeSitterRepoPath = path.join(clonePath, repoSubpath);

    console.log('Updating wasmtime');
    child_process.execSync('cargo update -p wasmtime', {
        cwd: treeSitterRepoPath,
        stdio: 'inherit',
        encoding: 'utf-8'
    });

    const builtWasmPath = path.join(treeSitterRepoPath, 'lib/binding_web');


    console.log('Executing build-wasm script');
    child_process.execSync('npm install', {
        cwd: builtWasmPath,
        stdio: 'inherit',
        encoding: 'utf-8'
    });

    console.log('Executing build-wasm script');
    child_process.execSync('npm run build', {
        cwd: builtWasmPath,
        stdio: 'inherit',
        encoding: 'utf-8'
    });

    const jsFile = 'tree-sitter.js';
    const dtsFile = 'web-tree-sitter.d.ts';
    const files = [
        'tree-sitter.wasm',
        dtsFile,
        jsFile
    ];

    for (const file of files) {
        const src = path.join(builtWasmPath, file);
        const dest = path.join(outputPath, file);
        console.log(`Copying ${src} to ${dest}`);
        child_process.execSync(`cp ${src} ${dest}`);
    }
}