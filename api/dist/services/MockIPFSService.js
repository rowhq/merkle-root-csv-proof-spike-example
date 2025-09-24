"use strict";
/**
 * Mock IPFS service for development - can be replaced with real IPFS implementation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockIPFSService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class MockIPFSService {
    mockDir = path_1.default.join(process.cwd(), 'mock-ipfs');
    constructor() {
        // Directory will be created on first upload
    }
    async ensureMockDir() {
        try {
            await promises_1.default.access(this.mockDir);
        }
        catch {
            await promises_1.default.mkdir(this.mockDir, { recursive: true });
        }
    }
    async upload(data) {
        // Ensure directory exists
        await this.ensureMockDir();
        // Generate mock IPFS hash (QmHash format)
        const hash = 'Qm' + crypto_1.default.createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex')
            .substring(0, 44);
        // Store in mock directory
        const filePath = path_1.default.join(this.mockDir, `${hash}.json`);
        await promises_1.default.writeFile(filePath, JSON.stringify(data, null, 2));
        return hash;
    }
    async retrieve(hash) {
        try {
            const filePath = path_1.default.join(this.mockDir, `${hash}.json`);
            const data = await promises_1.default.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            throw new Error(`Failed to retrieve data for hash: ${hash}`);
        }
    }
}
exports.MockIPFSService = MockIPFSService;
//# sourceMappingURL=MockIPFSService.js.map