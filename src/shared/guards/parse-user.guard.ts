import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../entites/user.entity';
import { Context } from "telegraf";

@Injectable()
export class ParseUserGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (request instanceof Context) {
      return true;
    }
    const bearerToken = request.header('Authorization');
    if (bearerToken) {
      const authToken = bearerToken.split(' ')[1];
      const user = this.jwtService.decode<UserEntity>(authToken);
      (request as any).user = user;
    }
    return true;
  }
}
