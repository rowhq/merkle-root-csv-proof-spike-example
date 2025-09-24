/**
 * Interface for IPFS operations - can be mocked or replaced
 */
export interface IIPFSService {
    /**
     * Upload data to IPFS and return hash
     */
    upload(data: any): Promise<string>;
    /**
     * Retrieve data from IPFS by hash
     */
    retrieve(hash: string): Promise<any>;
}
//# sourceMappingURL=IIPFSService.d.ts.map