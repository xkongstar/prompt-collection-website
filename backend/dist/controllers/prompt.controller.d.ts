import { Request, Response, NextFunction } from 'express';
export declare class PromptController {
    getPrompts(req: Request, res: Response, next: NextFunction): Promise<void>;
    getPromptById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    createPrompt(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    updatePrompt(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    deletePrompt(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    incrementUsage(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    copyPrompt(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=prompt.controller.d.ts.map