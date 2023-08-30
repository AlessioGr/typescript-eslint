"use strict";
// this script uses the github api to fetch a list of contributors
// https://developer.github.com/v3/repos/#list-contributors
// this endpoint returns a list of contributors sorted by number of contributions
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const IGNORED_USERS = new Set([
    'dependabot[bot]',
    'eslint[bot]',
    'greenkeeper[bot]',
    'semantic-release-bot',
]);
const COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT = 3;
const PAGE_LIMIT = 100;
const contributorsApiUrl = `https://api.github.com/repos/typescript-eslint/typescript-eslint/contributors?per_page=${PAGE_LIMIT}`;
async function getData(url) {
    if (url == null) {
        return null;
    }
    const response = await (0, cross_fetch_1.default)(url, {
        method: 'GET',
        headers: {
            Accept: 'application/vnd.github.v3+json',
            // Authorization: 'token ghp_*', // if needed, replace this with your token
        },
    });
    return (await response.json());
}
async function* fetchUsers(page = 1) {
    let lastLength = 0;
    do {
        const contributors = await getData(`${contributorsApiUrl}&page=${page}`);
        if (!Array.isArray(contributors)) {
            throw new Error(contributors?.message ?? 'An error occurred');
        }
        const thresholdedContributors = contributors.filter(user => user.contributions >= COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT);
        yield thresholdedContributors;
        lastLength = thresholdedContributors.length;
    } while (
    /*
      If the filtered list wasn't 100 long, that means that either:
      - there wasn't 100 users in the page, or
      - there wasn't 100 users with > threshold commits in the page.

      In either case, it means that there's no need to fetch any more pages
    */
    lastLength === PAGE_LIMIT);
}
function writeTable(contributors, perLine = 5) {
    const columns = contributors.length > perLine ? perLine : contributors.length;
    const lines = [
        '<!-- ------------------------------------------',
        ' |      DO NOT MODIFY THIS FILE MANUALLY      |',
        ' |                                            |',
        ' | THIS FILE HAS BEEN AUTOMATICALLY GENERATED |',
        ' |                                            |',
        ' |     YOU CAN REGENERATE THIS FILE USING     |',
        ' |         yarn generate-contributors         |',
        ' ------------------------------------------- -->',
        '',
        '# Contributors',
        '',
        'Thanks goes to these wonderful people:',
        '',
        '<!-- prettier-ignore-start -->',
        '<!-- markdownlint-disable -->',
        '<table>',
    ];
    let i = 0;
    for (const usr of contributors) {
        if (i % columns === 0) {
            if (i !== 0) {
                lines.push('  </tr>');
            }
            lines.push('  <tr>');
        }
        const image = `<img src="${usr.avatar_url}&size=100" width="100px;" alt=""/>`;
        const name = `<sub><b>${usr.name || usr.login}</b></sub>`;
        lines.push(`    <td align="center"><a href="${usr.html_url}">${image}<br />${name}</a></td>`);
        ++i;
    }
    if (i % columns !== 0) {
        lines.push('  </tr>');
    }
    lines.push('</table>');
    lines.push('');
    lines.push('<!-- markdownlint-restore -->');
    lines.push('<!-- prettier-ignore-end -->');
    lines.push('');
    lines.push(`<sup>This list is auto-generated using \`yarn generate-contributors\`. It shows the top ${PAGE_LIMIT} contributors with > ${COMPLETELY_ARBITRARY_CONTRIBUTION_COUNT} contributions.</sup>`);
    lines.push('');
    fs.writeFileSync(path.join(__dirname, '../CONTRIBUTORS.md'), lines.join('\n'));
}
async function main() {
    const githubContributors = [];
    // fetch all of the contributor info
    for await (const lastUsers of fetchUsers()) {
        githubContributors.push(...lastUsers);
    }
    // fetch the user info
    const users = await Promise.allSettled(githubContributors
        // remove ignored users and bots
        .filter(usr => usr.login && usr.type !== 'Bot' && !IGNORED_USERS.has(usr.login))
        // fetch the in-depth information for each user
        .map(c => getData(c.url)));
    writeTable(users
        .map(result => {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        return null;
    })
        .filter((c) => c?.login != null), 5);
}
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=generate-contributors.js.map