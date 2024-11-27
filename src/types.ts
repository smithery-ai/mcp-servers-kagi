/**
 * Custom error class for Kagi API errors
 */
export class KagiError extends Error {
    /** HTTP status code if applicable */
    code?: number;
    /** Additional error details */
    details?: Record<string, any>;

    constructor(message: string, code?: number, details?: Record<string, any>) {
        super(message);
        this.name = 'KagiError';
        this.code = code;
        this.details = details;
    }
}

/**
 * Common metadata returned in all Kagi API responses
 */
export interface Meta {
    /** Unique response identifier */
    id: string;
    /** Server node identifier */
    node: string;
    /** Response time in milliseconds */
    ms: number;
    /** Remaining API balance, if available */
    api_balance?: number;
}

/**
 * Image object used in search results
 */
export interface Image {
    /** Image URL */
    url: string;
    /** Image height in pixels */
    height: number;
    /** Image width in pixels */
    width: number;
}

/**
 * Individual search result item
 */
export interface SearchItem {
    /** Item type identifier */
    t: number;
    /** Search result ranking position */
    rank?: number;
    /** Result URL */
    url?: string;
    /** Result title */
    title?: string;
    /** Text snippet or description */
    snippet?: string;
    /** Publication date in ISO format */
    published?: string;
    /** Thumbnail image if available */
    thumbnail?: Image;
    /** List items if result is a list */
    list?: string[];
}

/**
 * Complete search response
 */
export interface SearchResponse {
    /** Response metadata */
    meta: Meta;
    /** Array of search results */
    data: SearchItem[];
    /** Optional error information */
    error?: Record<string, any>[];
}

/**
 * Result of a summarization request
 */
export interface SummarizationItem {
    /** Generated summary text */
    output: string;
    /** Number of tokens in the summary */
    tokens: number;
}

/**
 * Complete summarization response
 */
export interface SummarizationResponse {
    /** Response metadata */
    meta: Meta;
    /** Summarization result */
    data: SummarizationItem;
    /** Optional error information */
    error?: Record<string, any>[];
}

/**
 * Reference source for FastGPT responses
 */
export interface FastGPTReference {
    /** Reference title */
    title: string;
    /** Text snippet from reference */
    snippet: string;
    /** Reference URL */
    url: string;
}

/**
 * FastGPT response content
 */
export interface FastGPTItem {
    /** Generated response text */
    output: string;
    /** Number of tokens in the response */
    tokens: number;
    /** Source references used */
    references: FastGPTReference[];
}

/**
 * Complete FastGPT response
 */
export interface FastGPTResponse {
    /** Response metadata */
    meta: Meta;
    /** FastGPT result */
    data: FastGPTItem;
    /** Optional error information */
    error?: Record<string, any>[];
}

/**
 * Individual enriched news item
 */
export interface EnrichItem {
    /** Item type identifier */
    t: number;
    /** News article URL */
    url?: string;
    /** Article title */
    title?: string;
    /** Article snippet or description */
    snippet?: string;
    /** Publication date in ISO format */
    published?: string;
}

/**
 * Complete news enrichment response
 */
export interface EnrichResponse {
    /** Response metadata */
    meta: Meta;
    /** Array of enriched news items */
    data: EnrichItem[];
    /** Optional error information */
    error?: Record<string, any>[];
}

/**
 * Parameters for search requests
 */
export interface SearchParams {
    /** Search query string */
    q: string;
    /** Maximum number of results to return */
    limit?: number;
}

/**
 * Parameters for summarization requests
 */
export interface SummarizeParams {
    /** URL of content to summarize */
    url?: string;
    /** Raw text to summarize */
    text?: string;
    /** Summarization engine to use */
    engine?: 'cecil' | 'agnes' | 'daphne' | 'muriel';
    /** Type of summary to generate */
    summary_type?: 'summary' | 'takeaway';
    /** Target language for the summary */
    target_language?: string;
    /** Whether to use cached results */
    cache?: boolean;
}

/**
 * Parameters for FastGPT requests
 */
export interface FastGPTParams {
    /** Query for FastGPT */
    query: string;
    /** Whether to use cached results */
    cache?: boolean;
}

/**
 * Parameters for news enrichment requests
 */
export interface EnrichParams {
    /** News query to enrich */
    q: string;
}

/**
 * Configuration options for the Kagi API client
 */
export interface KagiConfig {
    /** Kagi API key */
    apiKey: string;
    /** Optional base URL override */
    baseURL?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
}