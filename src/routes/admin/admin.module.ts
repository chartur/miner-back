import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

console.log(join(__dirname, '..', '..', 'assets'));

@Module({
  controllers: [AuthController],
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', '..', 'assets', 'css'),
    // }),
  ]
})
export class AdminModule {}
