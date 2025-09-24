/**
 * Mock IPFS service for development - can be replaced with real IPFS implementation
 */
import { IIPFSService } from '../interfaces/IIPFSService';
export declare class MockIPFSService implements IIPFSService {
    private readonly mockDir;
    constructor();
    private ensureMockDir;
    upload(data: any): Promise<string>;
    retrieve(hash: string): Promise<any>;
}
//# sourceMappingURL=MockIPFSService.d.ts.map