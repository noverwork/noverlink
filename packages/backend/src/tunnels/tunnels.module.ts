import { Module } from '@nestjs/common';

import { AppConfigModule } from '../app-config';
import { AuthModule } from '../auth/auth.module';
import { CliAuthGuard } from './guards/cli-auth.guard';
import { TunnelsController } from './tunnels.controller';
import { TunnelsService } from './tunnels.service';

@Module({
  imports: [AppConfigModule, AuthModule],
  controllers: [TunnelsController],
  providers: [TunnelsService, CliAuthGuard],
  exports: [TunnelsService],
})
export class TunnelsModule {}
