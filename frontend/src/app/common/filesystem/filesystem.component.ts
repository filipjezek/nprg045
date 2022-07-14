import { Component, Input, OnInit } from '@angular/core';
import { FolderInfo } from 'src/app/store/reducers/filesystem.reducer';

@Component({
  selector: 'mozaik-filesystem',
  templateUrl: './filesystem.component.html',
  styleUrls: ['./filesystem.component.scss'],
})
export class FilesystemComponent implements OnInit {
  @Input() files: FolderInfo;
  @Input() current: string;

  constructor() {}

  ngOnInit(): void {}
}
