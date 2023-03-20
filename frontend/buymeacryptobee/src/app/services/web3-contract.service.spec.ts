import { TestBed } from '@angular/core/testing';

import { Web3ContractService } from './web3-contract.service';

describe('Web3ContractService', () => {
  let service: Web3ContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Web3ContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
