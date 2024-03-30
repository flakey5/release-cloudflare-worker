/**
 * A provider is something that provides files and stuff
 */
export interface Provider {
  head(request: Request, path: string): Promise<HeadResult>;

  getFile(request: Request, path: string): Promise<GetFileResult>;

  readDirectory(request: Request, path: string): Promise<ReadDirectoryResult>;
}

export type HttpHeaders = {
  etag: string;
  'accept-range': string;
  'access-control-allow-origin'?: string;
  'cache-control': string;
  expires?: string;
  'last-modified': string;
  'content-encoding'?: string;
  'content-type'?: string;
  'content-language'?: string;
  'content-disposition'?: string;
  'content-length': string;
};

export type HeadResult =
  | {
      /**
       * Does the file exist?
       */
      exists: false;
    }
  | {
      /**
       * Does the file exist?
       */
      exists: true;

      /**
       * Status code of the get file request
       */
      httpStatus: number;

      /**
       * Headers to send to client
       */
      httpHeaders: HttpHeaders;
    };

export type GetFileResult =
  | {
      /**
       * Does the file exist?
       */
      exists: false;
    }
  | {
      /**
       * Does the file exist?
       */
      exists: true;

      /**
       * Body of the file
       */
      body?: ReadableStream | null;

      /**
       * Status code of the get file request
       */
      httpStatus: number;

      /**
       * Headers to send to client
       */
      httpHeaders: HttpHeaders;
    };

export type File = {
  name: string;
  lastModified: Date;
  size: number;
};

export type ReadDirectorySuccessResult = {
  exists: true;

  subdirectories: string[];

  files: File[];
};

export type ReadDirectoryResult =
  | {
      exists: false;
    }
  | {
      exists: true;

      body: string | ReadableStream | null;

      httpStatus: number;

      httpHeaders: HttpHeaders;
    }
  | ReadDirectorySuccessResult;
