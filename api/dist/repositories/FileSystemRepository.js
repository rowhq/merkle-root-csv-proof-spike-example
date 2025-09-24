"use strict";
/**
 * File-based storage implementation for development
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemRepository = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class FileSystemRepository {
    dataDir = path_1.default.join(process.cwd(), 'data');
    constructor() {
        this.ensureDataDir();
    }
    async ensureDataDir() {
        try {
            await promises_1.default.access(this.dataDir);
        }
        catch {
            await promises_1.default.mkdir(this.dataDir, { recursive: true });
        }
    }
    async saveTree(treeId, treeData) {
        const filePath = path_1.default.join(this.dataDir, `tree_${treeId}.json`);
        await promises_1.default.writeFile(filePath, JSON.stringify(treeData, null, 2));
    }
    async saveClaims(treeId, claims) {
        const filePath = path_1.default.join(this.dataDir, `claims_${treeId}.json`);
        await promises_1.default.writeFile(filePath, JSON.stringify(claims, null, 2));
    }
    async getTree(treeId) {
        try {
            const filePath = path_1.default.join(this.dataDir, `tree_${treeId}.json`);
            const data = await promises_1.default.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async getClaims(treeId) {
        try {
            const filePath = path_1.default.join(this.dataDir, `claims_${treeId}.json`);
            const data = await promises_1.default.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
    async getUserProof(treeId, userAddress) {
        const claims = await this.getClaims(treeId);
        return claims ? claims[userAddress.toLowerCase()] || null : null;
    }
}
exports.FileSystemRepository = FileSystemRepository;
//# sourceMappingURL=FileSystemRepository.js.map