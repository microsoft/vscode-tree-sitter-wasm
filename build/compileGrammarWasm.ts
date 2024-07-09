import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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
}

export async function ensureWasm(grammar: ITreeSitterGrammar, outputPath: string): Promise<void> {
	console.log(`Building ${grammar.name}!`);
	const folderPath = path.join(PROJECT_ROOT, 'node_modules', grammar.projectPath || grammar.name);

	// Create .build folder if it doesn't exist
	await fs.promises.mkdir(outputPath, { recursive: true });

	const treeSitterBinPath = path.join(PROJECT_ROOT, 'node_modules', '.bin', 'tree-sitter');
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
