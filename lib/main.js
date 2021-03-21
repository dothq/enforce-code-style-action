"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const execa_1 = __importDefault(require("execa"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const execute = (cmd, args) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        var _a;
        core_1.default.info(`Running \`${cmd}\` with args ${JSON.stringify(args)}...`);
        const proc = execa_1.default(cmd, [...args]);
        (_a = proc.stdout) === null || _a === void 0 ? void 0 : _a.pipe(process.stdout);
        proc.on("exit", (c) => {
            if (c == 0) {
                resolve(true);
            }
            else
                reject(c);
        });
    });
});
const setupGit = (name, email, token) => {
    var _a;
    fs_1.default.appendFile('.git/config', `
[user]
    name = ${name}
    email = ${email}
`, (e) => { throw e; });
    fs_1.default.writeFile(path_1.default.resolve(os_1.default.homedir(), '.netrc'), `
machine github.com
login ${(_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.replace(/\/.+/, '')}
password ${token}
    `, (e) => { throw e; });
};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prettierArgs = core_1.default.getInput('prettierArgs') || '.';
            const token = core_1.default.getInput('token') || '';
            const gitEmail = core_1.default.getInput('gitEmail') || '';
            const gitName = core_1.default.getInput('gitName') || '';
            const commitMsg = core_1.default.getInput('commitMsg') || '';
            const args = prettierArgs === null || prettierArgs === void 0 ? void 0 : prettierArgs.split(" ");
            yield execute("npx", ["prettier", ...args]);
            core_1.default.info("Adding and committing changes...");
            const { stdout: branch } = yield execa_1.default("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
            setupGit(gitName, gitEmail, token);
            yield execute("git", ["add", "."]);
            yield execute("git", ["add", "."]);
            yield execute("git", ["commit", "-m", `"${commitMsg}"`]);
            yield execute("git", ["push", "origin", branch]);
        }
        catch (e) {
            core_1.default.setFailed(`Unexpected failure: ${e} (${e.message})`);
        }
    });
}
run();
