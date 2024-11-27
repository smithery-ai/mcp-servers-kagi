import { KagiAPI } from '../api.js';
import axios from 'axios';
import { KagiError } from '../types.js';

jest.mock('axios');

describe('KagiAPI', () => {
    const mockApiKey = 'test-api-key';
    let api: KagiAPI;
    let mockAxiosInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockAxiosInstance = {
            get: jest.fn(),
            post: jest.fn(),
            interceptors: {
                response: {
                    use: jest.fn()
                }
            }
        };
        (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
        api = new KagiAPI({ apiKey: mockApiKey });
    });

    describe('constructor', () => {
        it('should throw error when API key is missing', () => {
            expect(() => new KagiAPI({} as any)).toThrow('API key is required');
        });

        it('should create instance with default config', () => {
            expect(axios.create).toHaveBeenCalledWith({
                baseURL: 'https://kagi.com/api/v0',
                timeout: 30000,
                headers: {
                    'Authorization': 'Bot test-api-key',
                    'Content-Type': 'application/json'
                }
            });
        });
    });

    describe('search', () => {
        const mockSearchResponse = {
            data: {
                meta: { id: '123', node: 'test', ms: 100 },
                data: []
            }
        };

        it('should make GET request to /search with correct parameters', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce(mockSearchResponse);
            await api.search({ q: 'test query', limit: 5 });
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search', {
                params: {
                    q: 'test query',
                    limit: 5
                }
            });
        });

        it('should use default limit when not provided', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce(mockSearchResponse);
            await api.search({ q: 'test query' });
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search', {
                params: {
                    q: 'test query',
                    limit: 10
                }
            });
        });
    });

    describe('summarize', () => {
        const mockSummarizeResponse = {
            data: {
                meta: { id: '123', node: 'test', ms: 100 },
                data: { output: 'summary', tokens: 100 }
            }
        };

        it('should throw error when neither url nor text is provided', async () => {
            await expect(api.summarize({} as any)).rejects.toThrow('Either url or text parameter is required');
        });

        it('should throw error when both url and text are provided', async () => {
            await expect(api.summarize({ url: 'https://example.com', text: 'content' }))
                .rejects.toThrow('Cannot provide both url and text parameters');
        });

        it('should make GET request to /summarize with url parameter', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce(mockSummarizeResponse);
            await api.summarize({ url: 'https://example.com' });
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/summarize', {
                params: {
                    url: 'https://example.com',
                    cache: undefined
                }
            });
        });
    });

    describe('error handling', () => {
        it('should throw KagiError with API error details', async () => {
            let interceptorErrorHandler: (error: { response?: { status: number; data: { message: string; details: any } } }) => never;
            mockAxiosInstance.interceptors.response.use.mockImplementation((_: unknown, errorHandler: typeof interceptorErrorHandler) => {
                interceptorErrorHandler = errorHandler;
            });

            api = new KagiAPI({ apiKey: mockApiKey });

            const mockError = {
                response: {
                    status: 400,
                    data: {
                        message: 'Invalid request',
                        details: { error: 'Bad query' }
                    }
                }
            };

            mockAxiosInstance.get.mockImplementation(() => {
                throw interceptorErrorHandler(mockError);
            });

            await expect(api.search({ q: 'test' })).rejects.toThrow(KagiError);
            await expect(api.search({ q: 'test' })).rejects.toMatchObject({
                code: 400,
                message: 'Invalid request'
            });
        });
    });
    
    describe('testConnection', () => {
        it('should return true when search request succeeds', async () => {
            mockAxiosInstance.get.mockResolvedValueOnce({ 
                data: { meta: {}, data: [] } 
            });
            const result = await api.testConnection();
            expect(result).toBe(true);
        });

        it('should return false when search request fails', async () => {
            mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));
            const result = await api.testConnection();
            expect(result).toBe(false);
        });
    });
});