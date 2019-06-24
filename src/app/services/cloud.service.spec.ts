import { TestBed } from '@angular/core/testing';

import { CloudService } from './cloud.service';

describe('CloudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CloudService = TestBed.get(CloudService);
    expect(service).toBeTruthy();
  });
});
