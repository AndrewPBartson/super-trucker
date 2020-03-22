let thisPage = {}
module.exports = {
  '@tags': ['frontend'],
  beforeEach: browser => {
    thisPage = browser.page.ui_PgObj()
    thisPage.pgObjElements = thisPage.getPgObjElements()
    thisPage.navigate()
  },
  afterEach: browser => {
    thisPage
      .end()
  },
  'Hidden elements after refresh'(browser) {
    // "more settings" are hidden
    let hiddenOnes = ['settingsSubtitle', 'setTypical', 'setFast', 'setTrucker']
    for (let i = 0; i < hiddenOnes.length; i++) {
      thisPage
        .assert.not.visible(`@${hiddenOnes[i]}`)
    }
  },
  'Visible elements with "more settings"'(browser) {
    // click to make all elements visible:
    thisPage.click('@settingsButton')
    for (let i = 0; i < thisPage.pgObjElements.length; i++) {
      thisPage
        .assert.visible(`@${thisPage.pgObjElements[i]}`)
      // .expect.element(`@${thisPage.pgObjElements[i]}`).to.be.visible;
    }
  },
  'UI header tests'(browser) {
    thisPage
      .waitForElementVisible('@mainTitle')
      .verify.containsText('@mainTitle', 'SUPER TRUCKER')
  },
  'Test error messages'(browser) {
    thisPage
      // first trigger the errors:
      .click('@origin')
      .click('@endPoint')
      .click('@truckImage')
      // then look for the error messages
      .pause(10000)
  }

}
