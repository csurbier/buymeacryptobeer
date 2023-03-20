import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DappfooterComponent } from './dappfooter.component';

describe('DappfooterComponent', () => {
  let component: DappfooterComponent;
  let fixture: ComponentFixture<DappfooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DappfooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DappfooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
