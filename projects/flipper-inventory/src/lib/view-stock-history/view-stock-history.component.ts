import { Component, OnInit, HostListener, Inject, ViewChild, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSort, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { StockHistory, Variant } from '@enexus/flipper-components';
import { StockHistoryService } from './stock-history.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'flipper-view-stock-history',
  templateUrl: './view-stock-history.component.html',
  styleUrls: ['./view-stock-history.component.css']
})
export class ViewStockHistoryComponent implements OnInit, OnDestroy {
  constructor(public dialogRef: MatDialogRef<ViewStockHistoryComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private stockHsSvc: StockHistoryService) {
      this.dataSource = new MatTableDataSource([]);
      if (data.isArray) {
       this.data.variant.forEach(v => {
              this.variantIds.push(v.id);
              this.variants.push(v as Variant);
            });
        } else {
          this.variants.push(this.data.variant);
          this.variantIds.push(this.data.variant.id);
      }
      this.variantList.setValue(this.variantIds);
}

set loadAllStockHistory(variants: StockHistory[]) {
  this.dataSource = new MatTableDataSource(variants);
  this.dataSource.sort = this.sort;

  this.dataSource.paginator = this.paginator;

  this.loading = false;
}

  readonly displayedColumns: string[] = ['createdAt', 'variation', 'adjustment', 'note'];

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  private subscription: Subscription;
  loading = true;
  dataSource: MatTableDataSource<StockHistory>;
  variantList = new FormControl();
  variantIds: number[] = [];
  variants: Variant[] = [];

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (event.key === 'Esc') {
      this.dialogRef.close('done');
    }

    if (event.key === 'Enter') {
        this.dialogRef.close('done');
    }
  }
ngOnInit() {
  this.refresh();

}

ngOnDestroy() {
  this.subscription.unsubscribe();
}

updateList() {
  this.refresh();
}
refresh() {
  this.loading = true;
  if (this.variantList.value) {
    this.stockHsSvc.loadAllStockHistory(this.variantList.value).subscribe();
  }
  this.subscription = this.stockHsSvc.variantsSubject.subscribe((loadAllStockHistory) => this.loadAllStockHistory = loadAllStockHistory);

}

}
