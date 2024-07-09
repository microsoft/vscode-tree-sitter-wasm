import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export async function ensureTreeSitterWasm(repo: string, tag: string, clonePath: string, outputPath: string) {
    const repoSubpath = 'tree-sitter';
    try {
        await fs.rmdirSync(path.join(clonePath, repoSubpath), { recursive: true });
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
    child_process.execSync('./script/build-wasm', {
        cwd: treeSitterRepoPath,
        stdio: 'inherit',
        encoding: 'utf-8'
    });

    const builtWasmPath = path.join(treeSitterRepoPath, 'lib/binding_web');
    const jsFile = 'tree-sitter.js';
    const dtsFile = 'tree-sitter-web.d.ts';
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
    dtsFileContents = dtsFileContents.substring(dtsFileContents.indexOf('{') + 1, dtsFileContents.lastIndexOf('export = Parser'));
    dtsFileContents = dtsFileContents.replace('class Parser', 'export class Parser');
    dtsFileContents = dtsFileContents.replace('namespace Parser', 'export namespace Parser');
    fs.writeFileSync(dtsFilePath, dtsFileContents);

    const jsFilePath = path.join(outputPath, jsFile);
    let jsFileContents = fs.readFileSync(jsFilePath, 'utf-8');
    // Make it UMD.
    jsFileContents = `(function (global, factory) {
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
		typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
			(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Parser = {}));
})(this, (function () {

${jsFileContents}

	return { Parser: TreeSitter };
}));`

    fs.writeFileSync(jsFilePath, jsFileContents);
}