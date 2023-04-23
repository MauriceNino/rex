import { Request, Response } from 'express';
import wildcard from 'wildcard-match';

import { CONFIG } from './config';

class ParamError extends Error {
  constructor(public param: string) {
    super();
  }
}

type ParamOptions = {
  options?: string[];
};

type ParamMap = Record<string, ParamOptions & { value: string }>;

export class RouteBuilder {
  private paramMap: ParamMap = {};
  constructor(private req: Request, private res: Response) {}

  private validateParams() {
    const secret = this.req.query.secret;
    if (CONFIG.secret !== secret) throw new ParamError('secret');

    Object.entries(this.paramMap).forEach(([key, { options, value }]) => {
      if (options) {
        const valueMatcher = wildcard(options);
        if (!valueMatcher(value)) throw new ParamError(key);
      }
    });
  }

  public param(name: string, options?: ParamOptions): RouteBuilder {
    this.paramMap[name] = { ...options, value: this.req.query[name] as string };
    return this;
  }

  public async onCall(
    func: (params: ParamMap) => Promise<unknown>
  ): Promise<void> {
    try {
      this.validateParams();
      await func(this.paramMap);
      this.res.status(200).send();
    } catch (e) {
      if (e instanceof ParamError) {
        if (e.param === 'secret') {
          this.res.status(400).send('Authentication Error');
          return;
        } else {
          this.res.status(400).send(`Error with parameter ${e.param}`);
          return;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error((e as any).stderr ?? (e as any).message ?? (e as any));
      this.res.status(500).send('Unknown error');
    }
  }
}
