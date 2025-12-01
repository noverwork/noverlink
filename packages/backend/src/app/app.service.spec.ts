import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return hello message', () => {
      const result = service.getData();

      expect(result).toEqual({ message: 'Hello API' });
    });

    it('should always return the same structure', () => {
      const result = service.getData();

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
    });
  });
});
