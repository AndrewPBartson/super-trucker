let old_wPts_empty = [];

let wPts = [
  [
    36.85072,
    -76.28597
  ],
  [
    36.26759,
    -82.93762
  ],
  [
    35.11909,
    -90.54701
  ],
  [
    35.53117,
    -98.22784
  ],
  [
    35.0935,
    -106.26685
  ],
  [
    35.17901,
    -113.49362
  ],
  [
    34.02592,
    -118.77973
  ]
];
let old_wPts_same = [
  [
    36.85072,
    -76.28597
  ],
  [
    36.26759,
    -82.9376299
  ],
  [
    35.11909,
    -90.54701
  ],
  [
    35.53117,
    -98.22784
  ],
  [
    35.0935,
    -106.26685
  ],
  [
    35.17901,
    -113.49362
  ],
  [
    34.02592,
    -118.77973
  ]
];
let old_wPts_diff = [
  [
    36.85072,
    -76.28597
  ],
  [
    36.267599,
    -82.937629
  ],
  [
    35.119099,
    -90.547019
  ],
  [
    35.531179,
    -98.227849
  ],
  [
    35.09359,
    -106.266859
  ],
  [
    35.179019,
    -113.493629
  ],
  [
    34.02592,
    -118.77973
  ]
];

function compareWayPoints(arr_new, arr_old) {
  let allMatching = true;
  if (arr_old !== null && arr_old.length !== 0) {
    console.log('arr_old exists!');
    for (let i = 1; i < arr_new.length - 1 && allMatching; i++) {
      for (let j = 0; j < arr_new[i].length; j++) {
        console.log('arr_old[i][j] :', arr_old[i][j]);
        console.log('arr_new[i][j] :', arr_new[i][j]);
        if (arr_old[i][j] === arr_new[i][j]) {
          console.log('its a match!');
        } else {
          console.log('No match!');
          allMatching = false;
        }
        console.log(' ');
      }
    }
  } else {
    console.log('arr_old does not exist!');
  }
  console.log('allMatching :', allMatching);
}

compareWayPoints(wPts, old_wPts_same);
// compareWayPoints(wPts, old_wPts_empty);
// compareWayPoints(wPts, old_wPts_diff);
