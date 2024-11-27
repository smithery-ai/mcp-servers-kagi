import axios, { AxiosInstance } from 'axios';
import {
    KagiConfig,
    KagiError,
    SearchParams,
    SearchResponse,
    SummarizeParams,
    SummarizationResponse,
    FastGPTParams,
    FastGPTResponse,
    EnrichParams,
    EnrichResponse
} from './types.js';

/**
 * Client for interacting with the Kagi Search API
 * @example
 * ```typescript
 * const kagi = new KagiAPI({ apiKey: 'your-api-key' });
 * const results = await kagi.search({ q: 'typescript' });
 * ```
 */
export class KagiAPI {
    private readonly client: AxiosInstance;
    private static readonly DEFAULT_BASE_URL = 'https://kagi.com/api/v0';
    private static readonly DEFAULT_TIMEOUT = 30000;

    /**
     * Creates a new Kagi API client
     * @param config - Configuration options
     * @throws {Error} When API key is missing
     */
    constructor(config: KagiConfig) {
        if (!config.apiKey) {
            throw new Error('API key is required');
        }

        this.client = axios.create({
            baseURL: config.baseURL || KagiAPI.DEFAULT_BASE_URL,
            timeout: config.timeout || KagiAPI.DEFAULT_TIMEOUT,
            headers: {
                'Authorization': `Bot ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            response => response,
            error => {
                throw new KagiError(
                    error.response?.data?.message || error.message,
                    error.response?.status,
                    error.response?.data
                );
            }
        );
    }

    /**
     * Perform a web search
     * @param params - Search parameters
     * @param params.q - Search query
     * @param params.limit - Maximum number of results (default: 10)
     * @returns Promise resolving to search results
     * @throws {KagiError} On API errors
     * @example
     * ```typescript
     * const results = await kagi.search({
     *   q: 'typescript tutorial',
     *   limit: 5
     * });
     * ```
     */
    async search(params: SearchParams): Promise<SearchResponse> {
        const response = await this.client.get<SearchResponse>('/search', {
            params: {
                q: params.q,
                limit: params.limit || 10
            }
        });
        return response.data;
    }

    /**
     * Generate a summary from a URL or text
     * @param params - Summarization parameters
     * @returns Promise resolving to summary response
     * @throws {Error} When neither url nor text is provided, or both are provided
     * @throws {KagiError} On API errors
     * @example
     * ```typescript
     * const summary = await kagi.summarize({
     *   url: 'https://example.com',
     *   engine: 'cecil'
     * });
     * ```
     */
    async summarize(params: SummarizeParams): Promise<SummarizationResponse> {
        if (!params.url && !params.text) {
            throw new Error('Either url or text parameter is required');
        }
        if (params.url && params.text) {
            throw new Error('Cannot provide both url and text parameters');
        }

        const response = await this.client.get<SummarizationResponse>('/summarize', {
            params: {
                ...params,
                cache: params.cache !== undefined ? String(params.cache) : undefined
            }
        });
        return response.data;
    }

    /**
     * Get a FastGPT response
     * @param params - FastGPT parameters
     * @returns Promise resolving to FastGPT response
     * @throws {KagiError} On API errors
     * @example
     * ```typescript
     * const result = await kagi.fastgpt({
     *   query: 'Explain quantum computing'
     * });
     * ```
     */
    async fastgpt(params: FastGPTParams): Promise<FastGPTResponse> {
        const response = await this.client.post<FastGPTResponse>('/fastgpt', {
            query: params.query,
            cache: params.cache !== undefined ? String(params.cache) : undefined
        });
        return response.data;
    }

    /**
     * Get enriched news results
     * @param params - News enrichment parameters
     * @returns Promise resolving to enriched news response
     * @throws {KagiError} On API errors
     * @example
     * ```typescript
     * const news = await kagi.enrich({
     *   q: 'artificial intelligence'
     * });
     * ```
     */
    async enrich(params: EnrichParams): Promise<EnrichResponse> {
        const response = await this.client.get<EnrichResponse>('/enrich/news', {
            params: {
                q: params.q
            }
        });
        return response.data;
    }

    /**
     * Test API connectivity and credentials
     * @returns Promise resolving to boolean indicating success
     * @example
     * ```typescript
     * const isConnected = await kagi.testConnection();
     * console.log(isConnected ? 'Connected!' : 'Connection failed');
     * ```
     */
    async testConnection(): Promise<boolean> {
        try {
            // Perform a minimal search to test connectivity
            await this.search({ q: 'test', limit: 1 });
            return true;
        } catch (error) {
            return false;
        }
    }
}