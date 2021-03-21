import * as core from '@actions/core'

import execa from 'execa'
import fs from 'fs'
import path from 'path'
import os from 'os'

const execute = async (cmd: string, args: any[]) => {
    return new Promise((resolve, reject) => {
        core.info(`Running \`${cmd}\` with args ${JSON.stringify(args)}...`)

        const proc = execa(cmd, [...args]);
        proc.stdout?.pipe(process.stdout);

        proc.on("exit", (c) => {
            if(c == 0) {
                resolve(true);
            } else reject(c);
        })
    })
}

async function run() {
    try {        
        const prettierArgs = core.getInput('prettierArgs') || '.';
        const gitEmail = core.getInput('gitEmail') || '';
        const gitName = core.getInput('gitName') || '';
        const commitMsg = core.getInput('commitMsg') || '';

        const args = prettierArgs?.split(" ");

        await execute("npx", ["prettier", ...args]);

        core.info("Adding and committing changes...")

        const { stdout: branch } = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"])

        await execute("git", ["config", "user.name", gitName])
        await execute("git", ["config", "user.email", gitEmail])

        await execute("git", ["add", "."])
        await execute("git", ["add", "."])
        await execute("git", ["commit", "-m", commitMsg])
        await execute("git", ["push", "origin", branch])
    } catch(e) {
        if(e) console.log(e)
    }
}

run()