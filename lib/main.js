"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const execa_1 = __importDefault(require("execa"));
const execute = (cmd, args) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        var _a;
        core.info(`Running \`${cmd}\` with args ${JSON.stringify(args)}...`);
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
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prettierArgs = core.getInput('prettierArgs') || '.';
            const gitEmail = core.getInput('gitEmail') || '';
            const gitName = core.getInput('gitName') || '';
            const commitMsg = core.getInput('commitMsg') || '';
            const args = prettierArgs === null || prettierArgs === void 0 ? void 0 : prettierArgs.split(" ");
            yield execute("npx", ["prettier", ...args]);
            core.info("Adding and committing changes...");
            const { stdout: branch } = yield execa_1.default("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
            yield execute("git", ["config", "user.name", gitName]);
            yield execute("git", ["config", "user.email", gitEmail]);
            yield execute("git", ["add", "."]);
            yield execute("git", ["add", "."]);
            yield execute("git", ["commit", "-m", commitMsg]);
            yield execute("git", ["push", "origin", branch]);
        }
        catch (e) {
            if (e)
                console.log(e);
        }
    });
}
run();
