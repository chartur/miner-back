import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../entites/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async signIn(user: Partial<UserEntity>): Promise<string> {
    return await this.jwtService.signAsync({
      ...user,
    });
  }
}
