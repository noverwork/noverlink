import { Module } from '@nestjs/common';

import { AppConfigModule } from '../app-config';
import { RelayAuthGuard } from './guards';
import { RelayController } from './relay.controller';
import { RelayService } from './relay.service';

@Module({
  imports: [AppConfigModule],
  controllers: [RelayController],
  providers: [RelayService, RelayAuthGuard],
})
export class RelayModule {}
