/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { clone, patch } from './git';

const PROJECT_ROOT = path.dirname(__dirname);

export interface ITreeSitterGrammar {
	name: string;
	/**
	 * A custom .wasm filename if the grammar node module doesn't follow the standard naming convention
	 */
	filename?: string;
	/**
	 * The path where we should spawn `tree-sitter build-wasm`
	 */
	projectPath?: string;

	git?: {
		repo: string;
		sha: string;
	} | {
		repo: string;
		tag: string
	}
}

export async function ensureWasm(grammar: ITreeSitterGrammar, outputPath: string): Promise<void> {
	console.log(`Building ${grammar.name}!`);
	const nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules');
	if (grammar.git) {
		const git = grammar.git as { repo: string; sha?: string; tag?: string; installCommand?: string };
		clone(grammar.git.repo, git.tag, git.sha, grammar.name, nodeModulesPath);

		// Apply patches for this grammar if any exist in patches/<grammar.name>
		const patchesDir = path.join(PROJECT_ROOT, 'patches', grammar.name);
		if (fs.existsSync(patchesDir)) {
			const patchFiles = fs.readdirSync(patchesDir).filter(f => f.endsWith('.patch'));
			for (const file of patchFiles) {
				console.log(`Applying patch ${file} for ${grammar.name}`);
				patch(nodeModulesPath, grammar.name, path.join(patchesDir, file));
			}
		}
	}

	// Create .build folder if it doesn't exist
	await fs.promises.mkdir(outputPath, { recursive: true });

	const treeSitterBinPath = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'tree-sitter');
	const folderPath = path.join(nodeModulesPath, grammar.projectPath || grammar.name);
	const command = `node ${treeSitterBinPath} build --wasm ${folderPath}`;
	console.log(`Executing: ${command}`);
	child_process.execSync(command, {
		stdio: 'inherit',
		cwd: outputPath,
		encoding: 'utf8'
	});

	// Rename to a consistent name if necessary
	if (grammar.filename) {
		await fs.promises.rename(path.join(outputPath, `${grammar.filename}`), path.join(outputPath, `${grammar.name}.wasm`));
	}
}