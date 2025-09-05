import { Request, Response, NextFunction } from 'express';
export declare class TagController {
    getTags(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTagById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    createTag(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    updateTag(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deleteTag(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    createBatchTags(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getTagStats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=tag.controller.d.ts.map