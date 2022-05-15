import { TestBed } from '@angular/core/testing';

import { ResizeService } from './resize.service';

describe('ResizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResizeService = TestBed.get(ResizeService);
    expect(service).toBeTruthy();
  });
});
