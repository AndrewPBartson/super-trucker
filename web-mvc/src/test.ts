// This file required by karma.conf.js,  loads recursively all .spec & framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// initialize angular test environment
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// find all tests
const context = require.context('./', true, /\.spec\.ts$/);
// load modules
context.keys().map(context);
