"use strict";
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
const prettier = __importStar(require("prettier"));
const graphqlEndpoint = 'https://api.opencollective.com/graphql/v2';
const queries = {
    account: `{
    account(slug: "typescript-eslint") {
      orders(status: ACTIVE, limit: 1000) {
        totalCount
        nodes {
          tier {
            slug
          }
          fromAccount {
            id
            imageUrl
            name
            website
          }
        }
      }
    }
  }`,
    collective: `{
    collective(slug: "typescript-eslint") {
      members(limit: 1000, role: BACKER) {
        nodes {
          account {
            id
            imageUrl
            name
            website
          }
          tier {
            amount {
              valueInCents
            }
            orders(limit: 100) {
              nodes {
                amount {
                  valueInCents
                }
              }
            }
          }
          totalDonations {
            valueInCents
          }
          updatedAt
        }
      }
    }
  }`,
};
const excludedNames = new Set([
    'Guest',
    'Josh Goldberg', // Team member 💖
]);
async function requestGraphql(key) {
    const response = await (0, cross_fetch_1.default)(graphqlEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queries[key] }),
    });
    const { data } = (await response.json());
    return data[key];
}
async function main() {
    const [account, collective] = await Promise.all([
        requestGraphql('account'),
        requestGraphql('collective'),
    ]);
    const accountsById = account.orders.nodes.reduce((accumulator, account) => {
        const name = account.fromAccount.name || account.fromAccount.id;
        accumulator[name] = {
            ...accumulator[name],
            ...account.fromAccount,
        };
        return accumulator;
    }, {});
    const totalDonationsById = collective.members.nodes.reduce((accumulator, member) => {
        const name = member.account.name || member.account.id;
        accumulator[name] ||= 0;
        accumulator[name] += member.totalDonations.valueInCents;
        return accumulator;
    }, {});
    const uniqueNames = new Set(excludedNames);
    const allSponsorsConfig = collective.members.nodes
        .map(member => {
        const name = member.account.name || member.account.id;
        const fromAccount = {
            ...member.account,
            ...accountsById[name],
        };
        const totalDonations = totalDonationsById[name];
        const website = fromAccount.website;
        return {
            id: name,
            image: fromAccount.imageUrl,
            name: fromAccount.name,
            totalDonations,
            twitterHandle: fromAccount.twitterHandle,
            website,
        };
    })
        .filter(({ id, totalDonations, website }) => {
        if (uniqueNames.has(id) || totalDonations < 10000 || !website) {
            return false;
        }
        uniqueNames.add(id);
        return true;
    })
        .sort((a, b) => b.totalDonations - a.totalDonations);
    const rcPath = path.resolve(__dirname, '../packages/website/data/sponsors.json');
    fs.writeFileSync(rcPath, await stringifyObject(rcPath, allSponsorsConfig));
}
async function stringifyObject(filePath, data) {
    const config = await prettier.resolveConfig(filePath);
    const text = JSON.stringify(data, (_, value) => value ?? undefined, 2);
    return prettier.format(text, {
        ...config,
        parser: 'json',
    });
}
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=generate-sponsors.js.map