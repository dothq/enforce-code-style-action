import * as github from '@actions/github'

import core from '@actions/core'

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

const setupGit = (name, email, token) => {
    fs.appendFile('.git/config', `
[user]
    name = ${name}
    email = ${email}
`, (e) => { throw e });

    fs.writeFile(path.resolve(os.homedir(), '.netrc'), `
machine github.com
login ${process.env.GITHUB_REPOSITORY?.replace(/\/.+/, '')}
password ${token}
    `, (e) => { throw e });
}

async function run() {
    try {        
        const prettierArgs = core.getInput('prettierArgs') || '.';
        const token = core.getInput('token') || '';
        const gitEmail = core.getInput('gitEmail') || '';
        const gitName = core.getInput('gitName') || '';
        const commitMsg = core.getInput('commitMsg') || '';

        const args = prettierArgs?.split(" ");

        await execute("npx", ["prettier", ...args]);

        core.info("Adding and committing changes...")

        const { stdout: branch } = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"])

        setupGit(gitName, gitEmail, token);

        await execute("git", ["add", "."])
        await execute("git", ["add", "."])
        await execute("git", ["commit", "-m", `"${commitMsg}"`])
        await execute("git", ["push", "origin", branch])
    } catch(e) {
        core.setFailed(`Unexpected failure: ${e} (${e.message})`)
    }
}

run()