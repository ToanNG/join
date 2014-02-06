module.exports = {
  "Demo test Join" : function (browser) {
    browser
      .url("http://localhost:3000")
      .waitForElementVisible('body', 1000)
      .setValue('#login-form input[name=username]', 'user1')
      .setValue('#login-form input[name=password]', 'admin2359')
      .waitForElementVisible('#login-form #submit-button', 1000)
      .click('#login-form #submit-button')
      .pause(1000)
      .assert.containsText('body', 'Toan Nguyen')
      .pause(1000)
      .click('#group-tab-52c7a1e76125d412e0000008 .group__name')
      .pause(3000)
      .end();
  }
};