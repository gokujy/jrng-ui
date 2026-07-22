import { Observable } from 'rxjs';

export interface JFileUploadResult<TRemote = unknown> {
  readonly remote?: TRemote;
  readonly serverErrors?: readonly string[];
}

export interface JFileUploadContext {
  readonly signal: AbortSignal;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly reportProgress: (progress: number) => void;
}

export interface JFileUploadAdapter<TRemote = unknown> {
  upload(
    file: File,
    context: JFileUploadContext,
  ): Observable<JFileUploadResult<TRemote>> | Promise<JFileUploadResult<TRemote>>;
}

export interface JFileChunkUploadContext extends JFileUploadContext {
  readonly chunkIndex: number;
  readonly chunkCount: number;
  readonly start: number;
  readonly end: number;
}

export interface JFileChunkUploadAdapter<TRemote = unknown> {
  readonly chunkSize: number;
  uploadChunk(
    file: File,
    chunk: Blob,
    context: JFileChunkUploadContext,
  ): Observable<unknown> | Promise<unknown>;
  complete?(file: File, context: JFileUploadContext): Promise<JFileUploadResult<TRemote>>;
}

export interface JFileRemoteItem<TRemote = unknown> {
  readonly id: string;
  readonly name: string;
  readonly size?: number;
  readonly type?: string;
  readonly url?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly source?: TRemote;
}
