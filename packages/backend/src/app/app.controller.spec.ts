import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: jest.Mocked<AppService>;

  beforeEach(async () => {
    const mockAppService = {
      getData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get(AppService);
  });

  describe('getData', () => {
    it('should return data from AppService', () => {
      const expectedData = { message: 'Hello API' };
      appService.getData.mockReturnValue(expectedData);

      const result = controller.getData();

      expect(result).toEqual(expectedData);
      expect(appService.getData).toHaveBeenCalled();
    });

    it('should call AppService getData once', () => {
      appService.getData.mockReturnValue({ message: 'test' });

      controller.getData();

      expect(appService.getData).toHaveBeenCalledTimes(1);
    });
  });
});
