/**
 * Single Responsibility: Handles verification operations
 */
import { IStorageRepository } from '../interfaces/IStorageRepository';
import { VerificationRequest, VerificationResult } from '../types';
export interface IVerificationService {
    verify(request: VerificationRequest): Promise<VerificationResult>;
}
export declare class VerificationService implements IVerificationService {
    private readonly storage;
    constructor(storage: IStorageRepository);
    verify(request: VerificationRequest): Promise<VerificationResult>;
}
//# sourceMappingURL=VerificationService.d.ts.map