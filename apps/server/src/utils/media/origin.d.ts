export function rememberGeneratedImageOrigin(path: string, asset: MediaAsset, bytes: Uint8Array, mimeType: string, signal?: AbortSignal): Promise<boolean>;
export function resolveOriginalImageUrl(path: string, bytes: Uint8Array, mimeType: string, signal?: AbortSignal): Promise<string | undefined>;
export function removeGeneratedImageOrigin(path: string): Promise<void>;
