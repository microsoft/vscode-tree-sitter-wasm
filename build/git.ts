/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

export function clone(repo: string, tag: string | undefined, commit: string | undefined, repoSubpath: string, clonePath: string): string {
    const repoPath = path.join(clonePath, repoSubpath);
    try {
        fs.rmSync(repoPath, { recursive: true });
    } catch (e) {
        // Ignore.
    }
    const command = `git clone ${tag ? `--branch ${tag} ` : ''}${repo} ${repoSubpath} ${commit ? '' : '--depth 1 '}--single-branch --no-tags`;
    console.log(`Executing: ${command}`);
    child_process.execSync(command, {
        stdio: 'inherit',
        cwd: clonePath,
        encoding: 'utf8'
    });

    if (commit) {
        child_process.execSync(`git checkout ${commit}`, {
            stdio: 'inherit',
            cwd: repoPath,
            encoding: 'utf8'});
    }

    return repoPath;
}