import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export async function ensureTreeSitterWasm(repo: string, tag: string, clonePath: string, outputPath: string) {
    const repoSubpath = 'tree-sitter';
    const command = `git clone --branch ${tag} ${repo} ${repoSubpath}`;
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
    const files = [
        'tree-sitter.wasm',
        'tree-sitter-web.d.ts',
        jsFile
    ];
    for (const file of files) {
        const src = path.join(builtWasmPath, file);
        const dest = path.join(outputPath, file);
        console.log(`Copying ${src} to ${dest}`);
        child_process.execSync(`cp ${src} ${dest}`);
    }

    const jsFilePath = path.join(outputPath, jsFile);
    let jsFileConents = fs.readFileSync(jsFilePath, 'utf-8');
    // Make it UMD.
    jsFileConents = `(function (global, factory) {
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
		typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
			(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Parser = {}));
})(this, (function () {

${jsFileConents}

	return { Parser: TreeSitter };
}));`

    fs.writeFileSync(jsFilePath, jsFileConents);
}