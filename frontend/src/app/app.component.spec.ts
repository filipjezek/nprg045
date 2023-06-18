import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import {
  Component,
  EventEmitter,
  NO_ERRORS_SCHEMA,
  Output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { StoreStub } from './testing/store.stub';
import { loadDirectory } from './store/actions/filesystem.actions';
import { State } from './store/reducers';
import { DialogService } from './services/dialog.service';
import { NetworkTrackerComponent } from './common/network-tracker/network-tracker.component';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'mozaik-multiview',
  template: '<ng-content></ng-content>',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
class MultiviewStub {}
@Component({
  selector: 'mozaik-multiview-partition',
  template: '<ng-content></ng-content>',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
class MultiviewPartitionStub {
  @Output() visible = new EventEmitter<boolean>();
}
@Component({
  selector: 'mozaik-multiview-toggle',
  template: '<ng-content></ng-content>',
})
class MultiviewToggleStub {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let el: HTMLElement;
  let storeStub: StoreStub<State>;
  let dialogStub: jasmine.SpyObj<DialogService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule],
      declarations: [
        AppComponent,
        MultiviewStub,
        MultiviewPartitionStub,
        MultiviewToggleStub,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Store, useClass: StoreStub },
        {
          provide: DialogService,
          useValue: jasmine.createSpyObj('dialogStub', ['open', 'close']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    storeStub = <any>TestBed.inject(Store);
    dialogStub = <any>TestBed.inject(DialogService);
    storeStub.subject.next({
      ui: { overlay: { opacity: 0, zIndex: 1, open: false } },
      net: { requests: [] },
    });
    el = fixture.nativeElement;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load filesystem on init', () => {
    fixture.detectChanges();
    expect(storeStub.dispatch).toHaveBeenCalled();
    expect(storeStub.dispatch.calls.mostRecent().args).toEqual([
      loadDirectory({}),
    ]);
  });

  describe('network dialog button', () => {
    it('should be visible only when there are active network requests', () => {
      fixture.detectChanges();
      expect(el.querySelector('.open-network')).toBeNull();

      storeStub.subject.next({
        ui: { overlay: { opacity: 0, zIndex: 1, open: false } },
        net: {
          requests: [{ id: 1, method: 'GET', retries: 0, start: 0, url: '' }],
        },
      });
      fixture.detectChanges();
      expect(el.querySelector('.open-network')).toBeTruthy();
    });

    it('should open network dialog', () => {
      storeStub.subject.next({
        ui: { overlay: { opacity: 0, zIndex: 1, open: false } },
        net: {
          requests: [{ id: 1, method: 'GET', retries: 0, start: 0, url: '' }],
        },
      });
      dialogStub.open.and.returnValue({ addEventListener: () => 0 } as any);

      fixture.detectChanges();
      expect(dialogStub.open).not.toHaveBeenCalledWith(
        NetworkTrackerComponent,
        jasmine.anything(),
        jasmine.anything()
      );
      el.querySelector<HTMLElement>('.open-network').click();
      fixture.detectChanges();
      expect(dialogStub.open).toHaveBeenCalledWith(
        NetworkTrackerComponent,
        jasmine.anything(),
        jasmine.anything()
      );
    });
  });

  describe('partitions', () => {
    const isNavToggle = (el: HTMLElement) =>
      el.textContent.includes('Navigator');
    const isInspToggle = (el: HTMLElement) =>
      el.textContent.includes('Inspector');
    const isNeuronToggle = (el: HTMLElement) =>
      el.textContent.includes('neurons');
    let toggles: HTMLElement[];
    const refreshToggles = () =>
      (toggles = Array.from(
        el.querySelectorAll<HTMLElement>('mozaik-multiview-toggle')
      ));
    let partitions: MultiviewPartitionStub[];

    beforeEach(() => {
      partitions = fixture.debugElement
        .queryAll(By.directive(MultiviewPartitionStub))
        .map((de) => de.componentInstance);
    });

    it('should hide inspector toggle when inspector is visible', () => {
      component.ratios = [50, 50, 0];
      partitions[0].visible.emit(true);
      partitions[1].visible.emit(true);
      fixture.detectChanges();
      refreshToggles();
      expect(toggles.some((t) => isInspToggle(t))).toBeFalsy();
    });
    it('should hide navigator toggle when navigator is visible', () => {
      component.ratios = [50, 50, 0];
      partitions[0].visible.emit(true);
      partitions[1].visible.emit(true);
      fixture.detectChanges();
      refreshToggles();
      expect(toggles.some((t) => isNavToggle(t))).toBeFalsy();
    });

    describe('navigator view', () => {
      beforeEach(() => {
        component.ratios = [100, 0, 0];
        fixture.detectChanges();
        refreshToggles();
      });

      it('should have inspector toggle visible', () => {
        expect(toggles.some((t) => isInspToggle(t))).toBeTruthy();
      });
      it('should open to inspector view', () => {
        toggles.find((t) => isInspToggle(t)).click();
        fixture.detectChanges();

        expect(component.ratios).toEqual([0, 100, 0]);
      });
    });

    describe('inspector view', () => {
      beforeEach(() => {
        component.ratios = [0, 100, 0];
        partitions[0].visible.emit(false);
        partitions[1].visible.emit(true);
        fixture.detectChanges();
        refreshToggles();
      });

      it('should have navigator and neurons toggle visible', () => {
        expect(toggles.some((t) => isNavToggle(t)))
          .withContext('nav toggle should be visible')
          .toBeTruthy();
        expect(toggles.some((t) => isNeuronToggle(t)))
          .withContext('neurons toggle should be visible')
          .toBeTruthy();
      });
      it('should open to navigator view', () => {
        toggles.find((t) => isNavToggle(t)).click();
        fixture.detectChanges();

        expect(component.ratios).toEqual([100, 0, 0]);
      });
      it('should show neurons sidebar', () => {
        toggles.find((t) => isNeuronToggle(t)).click();
        fixture.detectChanges();

        expect(component.ratios[0]).toEqual(0);
        expect(component.ratios[1] + component.ratios[2]).toEqual(100);
        expect(component.ratios[1] > 0 && component.ratios[2] > 0).toBeTruthy();
      });
    });

    describe('neurons sidebar visible', () => {
      beforeEach(() => {
        component.ratios = [0, 50, 50];
        partitions[0].visible.emit(false);
        partitions[1].visible.emit(true);
        partitions[2].visible.emit(true);
        fixture.detectChanges();
        refreshToggles();
      });

      it('neurons toggle visible', () => {
        expect(toggles.some((t) => isNeuronToggle(t)))
          .withContext('neurons toggle should be visible')
          .toBeTruthy();
      });
      it('should close the sidebar', () => {
        toggles.find((t) => isNeuronToggle(t)).click();
        fixture.detectChanges();

        expect(component.ratios).toEqual([0, 100, 0]);
      });
    });
  });
});
