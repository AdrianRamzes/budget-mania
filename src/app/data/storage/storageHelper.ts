export interface StorageHelper {
    save(data: string): Promise<void>;
    load(): Promise<string>;
}