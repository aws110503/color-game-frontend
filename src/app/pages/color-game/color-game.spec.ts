import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorGame } from './color-game';

describe('ColorGame', () => {
  let component: ColorGame;
  let fixture: ComponentFixture<ColorGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorGame],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
