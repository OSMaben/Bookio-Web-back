import { CanActivate } from "@nestjs/common";
import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.['cognito:groups']?.includes('Admin')) {
      throw new UnauthorizedException('Insufficient permissions');
    }
    return true;
  }
}
