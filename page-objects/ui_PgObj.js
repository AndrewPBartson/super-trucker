module.exports = {
  url: 'http://localhost:4200',
  elements: {
    truckImage: 'img.truckIcon',
    mainTitle: '#main_title',
    origin: '#origin',
    endPoint: '#end_point',
    weatherChkBox: '#weather-input',
    hotelsChkBox: '#hotels-input',
    truckStopsChkBox: '#truck_stops-input',
    settingsButton: '#settings_btn',
    typicalSettings: '#typical',
    fastSettings: '#fast',
    truckerSettings: '#trucker',
    averageSpeed: '#avg_speed',
    hoursDriving: '#hours_driving',
    milesPerDay: '#miles_per_day',
    departureTime: '#depart_time',
    createRouteBtn: '#create_route_btn',
    settingsSubtitle: 'div.item_F',
    setTypical: '.item_H',
    setFast: '.item_I',
    setTrucker: '.item_J'
  },
  commands: [{
    getPgObjElements() {
      return Object.keys(this.elements)
    },

    checkVisibilityOfAll(elems) {
      this.notVisiblePgObjElems = [];
    }

    // selectFilter(selector, value) {
    //     return this
    //         .click(selector)
    //         .click(`.goog-menuitem[value="${value}"]`);
    // },
    // search() {
    //     return this
    //         .click('@submitButton');
    // }
  }],
  pgObjElements: []
};
