/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { clone } from './git';

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
		installCommand?: string;
	} | {
		repo: string;
		tag: string
		installCommand?: string;
	}

	/**
	 * The command to use to build the grammar if not the default `tree-sitter build --wasm`
	 */
	treeSitter?: {
		command: string;
		cwd: string;
	}
}

export async function ensureWasm(grammar: ITreeSitterGrammar, outputPath: string): Promise<void> {
	console.log(`Building ${grammar.name}!`);
	const nodeModulesPath = path.join(PROJECT_ROOT, 'node_modules');
	if (grammar.git) {
		const git = grammar.git as { repo: string; sha?: string; tag?: string; installCommand?: string };
		clone(grammar.git.repo, git.tag, git.sha, grammar.name, nodeModulesPath);
		if (git.installCommand) {
			console.log(`Running install command: ${git.installCommand}`);
			child_process.execSync(git.installCommand, {
				stdio: 'inherit',
				cwd: path.join(nodeModulesPath, grammar.name),
				encoding: 'utf8'
			});
		}
	}

	// Create .build folder if it doesn't exist
	await fs.promises.mkdir(outputPath, { recursive: true });

	if (grammar.treeSitter) {
		const { cwd, command } = grammar.treeSitter;
		console.log(`Executing: ${command}`);
		child_process.execSync(command, {
			stdio: 'inherit',
			cwd: path.join(nodeModulesPath, cwd),
			encoding: 'utf8'
		});
		// Move the .wasm file to the outputPath
		const wasmFilename = grammar.filename ? grammar.filename : `${grammar.name}.wasm`;
		await fs.promises.copyFile(path.join(nodeModulesPath, cwd, wasmFilename), path.join(outputPath, `${grammar.name}.wasm`));
	} else {
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
}
