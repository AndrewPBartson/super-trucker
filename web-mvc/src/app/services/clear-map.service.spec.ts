import { TestBed } from '@angular/core/testing';

import { ClearMapService } from './clear-map.service';

describe('ClearMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClearMapService = TestBed.get(ClearMapService);
    expect(service).toBeTruthy();
  });
});
