import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatCheckboxModule, MatButtonModule, MatInputModule, MatAutocompleteModule,
    MatDatepickerModule, MatFormFieldModule, MatRadioModule, MatSelectModule,
    MatSliderModule, MatSlideToggleModule, MatMenuModule, MatSidenavModule,
    MatToolbarModule, MatListModule, MatGridListModule, MatCardModule, MatStepperModule,
    MatTabsModule, MatExpansionModule, MatButtonToggleModule, MatChipsModule,
    MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatDialogModule,
    MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule
} from '@angular/material';

import {ScrollingModule} from '@angular/cdk/scrolling';
import { DebugAComponent } from './debug-a/debug-a.component';

@NgModule({
    declarations: [
        AppComponent,
        DebugAComponent
    ],
    imports: [
        BrowserModule, FormsModule, BrowserAnimationsModule,
        MatCheckboxModule, MatButtonModule, MatInputModule, MatAutocompleteModule,
        MatDatepickerModule, MatFormFieldModule, MatRadioModule, MatSelectModule,
        MatSliderModule, MatSlideToggleModule, MatMenuModule, MatSidenavModule,
        MatToolbarModule, MatListModule, MatGridListModule, MatCardModule, MatStepperModule,
        MatTabsModule, MatExpansionModule, MatButtonToggleModule, MatChipsModule,
        MatIconModule, MatProgressSpinnerModule, MatProgressBarModule, MatDialogModule,
        MatTooltipModule, MatSnackBarModule, MatTableModule, MatSortModule, MatPaginatorModule,
        ScrollingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
