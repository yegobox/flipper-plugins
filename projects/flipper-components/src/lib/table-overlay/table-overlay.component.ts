import { Component, Input, OnInit } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'

@Component({
  selector: 'flipper-table-overlay',
  templateUrl: './table-overlay.component.html',
  styleUrls: ['./table-overlay.component.scss'],
})
export class TableOverlayComponent implements OnInit {
  @Input() loading: boolean
  @Input() dataSource: MatTableDataSource<any>
  @Input() noDataLabel: string
  @Input() title: string

  ngOnInit(): void {
    this.noDataLabel = this.noDataLabel || 'No data'
  }
}
