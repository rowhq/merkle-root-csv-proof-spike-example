/**
 * JSON Schema definitions for Merkle Tree API endpoints
 */
export declare const userDataSchema: {
    type: string;
    properties: {
        UserId: {
            type: string;
        };
        Email: {
            type: string;
        };
        UserAddress: {
            type: string;
        };
        Reputation: {
            type: string;
        };
        PrePoints: {
            type: string;
        };
        Points: {
            type: string;
        };
        CummulativePoints: {
            type: string;
        };
    };
};
export declare const requestBodySchema: {
    type: string;
    required: string[];
    properties: {
        date_generated: {
            type: string;
            description: string;
        };
        users_data: {
            type: string;
            description: string;
            items: {
                type: string;
                properties: {
                    UserId: {
                        type: string;
                    };
                    Email: {
                        type: string;
                    };
                    UserAddress: {
                        type: string;
                    };
                    Reputation: {
                        type: string;
                    };
                    PrePoints: {
                        type: string;
                    };
                    Points: {
                        type: string;
                    };
                    CummulativePoints: {
                        type: string;
                    };
                };
            };
        };
    };
};
export declare const successResponseSchema: {
    type: string;
    properties: {
        root: {
            type: string;
            description: string;
        };
        ipfsHash: {
            type: string;
            description: string;
        };
        createdAt: {
            type: string;
            description: string;
        };
    };
};
export declare const errorResponseSchema: {
    type: string;
    properties: {
        error: {
            type: string;
        };
    };
};
export declare const fileUploadSchema: {
    consumes: string[];
    requestBody: {
        content: {
            'multipart/form-data': {
                schema: {
                    type: string;
                    properties: {
                        file: {
                            type: string;
                            format: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
        };
    };
};
export declare const generateTreeSchema: {
    tags: string[];
    summary: string;
    description: string;
    body: {
        type: string;
        required: string[];
        properties: {
            date_generated: {
                type: string;
                description: string;
            };
            users_data: {
                type: string;
                description: string;
                items: {
                    type: string;
                    properties: {
                        UserId: {
                            type: string;
                        };
                        Email: {
                            type: string;
                        };
                        UserAddress: {
                            type: string;
                        };
                        Reputation: {
                            type: string;
                        };
                        PrePoints: {
                            type: string;
                        };
                        Points: {
                            type: string;
                        };
                        CummulativePoints: {
                            type: string;
                        };
                    };
                };
            };
        };
    };
    response: {
        200: {
            type: string;
            properties: {
                root: {
                    type: string;
                    description: string;
                };
                ipfsHash: {
                    type: string;
                    description: string;
                };
                createdAt: {
                    type: string;
                    description: string;
                };
            };
        };
        400: {
            type: string;
            properties: {
                error: {
                    type: string;
                };
            };
        };
        500: {
            type: string;
            properties: {
                error: {
                    type: string;
                };
            };
        };
    };
};
export declare const generateTreeFileSchema: {
    response: {
        200: {
            type: string;
            properties: {
                root: {
                    type: string;
                    description: string;
                };
                ipfsHash: {
                    type: string;
                    description: string;
                };
                createdAt: {
                    type: string;
                    description: string;
                };
            };
        };
        400: {
            type: string;
            properties: {
                error: {
                    type: string;
                };
            };
        };
        500: {
            type: string;
            properties: {
                error: {
                    type: string;
                };
            };
        };
    };
    consumes: string[];
    requestBody: {
        content: {
            'multipart/form-data': {
                schema: {
                    type: string;
                    properties: {
                        file: {
                            type: string;
                            format: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
        };
    };
    tags: string[];
    summary: string;
    description: string;
};
//# sourceMappingURL=MerkleTreeSchemas.d.ts.map