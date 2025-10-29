import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface RequestUser {
  sub: string;
  email: string;
  username: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const httpRequest = ctx.switchToHttp().getRequest();
    if (httpRequest?.user) {
      return httpRequest.user as RequestUser;
    }

    try {
      const gqlContext = GqlExecutionContext.create(ctx);
      return gqlContext.getContext().req?.user as RequestUser | undefined;
    } catch (error) {
      return undefined;
    }
  },
);
