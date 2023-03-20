import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DappheaderComponent } from './dappheader.component';

describe('DappheaderComponent', () => {
  let component: DappheaderComponent;
  let fixture: ComponentFixture<DappheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DappheaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DappheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
