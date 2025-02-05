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


    console.log('Installing dependencies');
    child_process.execSync('npm install', {
        cwd: builtWasmPath,
        stdio: 'inherit',
        encoding: 'utf-8'
    });

    console.log('Executing build-wasm script');
    child_process.execSync('npm run build', {
        cwd: builtWasmPath,
        stdio: 'inherit',
        encoding: 'utf-8',
        env: { ...process.env, EXPORT_ES6: '1', ESM: 'true' }
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

    const dtsFilePath = path.join(outputPath, dtsFile);
    let dtsFileContents = fs.readFileSync(dtsFilePath, 'utf-8');
    dtsFileContents = dtsFileContents.substring(dtsFileContents.indexOf('{') + 1, dtsFileContents.lastIndexOf('}'));
    dtsFileContents = dtsFileContents.replace(/\tclass/g, '\texport class');
    fs.writeFileSync(dtsFilePath, dtsFileContents);

    const jsFilePath = path.join(outputPath, jsFile);
    let jsFileContents = fs.readFileSync(jsFilePath, 'utf-8');

    const moduleExportKey = 'export {';
    const indexLastExport = jsFileContents.lastIndexOf(moduleExportKey);

    const exportsStart = indexLastExport + moduleExportKey.length;
    const exportsEnd = jsFileContents.indexOf('}', exportsStart);
    const exports = jsFileContents.substring(exportsStart, exportsEnd);

    jsFileContents = jsFileContents.substring(0, indexLastExport);

    // Make it UMD.
    jsFileContents = `(function (global, factory) {
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
		typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
			(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Parser = {}));
})(this, (function () {

    // Helper to replace import.meta.url
    function getCurrentScriptUrl() {
      if (typeof document !== 'undefined') {
          // Browser environment
          const script = document.currentScript;
          return script ? script.src : undefined;
      } else if (typeof __filename !== 'undefined') {
          // Node.js environment
          return require('url').pathToFileURL(__filename).href;
      }
      return undefined;
  }

${jsFileContents.replace(/import.meta.url/g, 'getCurrentScriptUrl()')}

	return { ${exports} };
}));`

    fs.writeFileSync(jsFilePath, jsFileContents);
}