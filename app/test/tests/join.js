module.exports = {
  "Test login" : function (browser) {
    browser
      .url("http://localhost:3000")
      .waitForElementVisible('body', 1000)
      .click('#login-button')
      .waitForElementVisible('#login-form', 1000)
      .setValue('#login-form input[name=username]', 'user1')
      .setValue('#login-form input[name=password]', 'admin2359')
      .click('#login-form #submit-button')
      .pause(1000)
      .assert.containsText('body', 'Group 1')
  },

  "Test chat" : function (browser) {
    browser
      .click('#group-tab-52c7a1e76125d412e0000008 .group__name')
      .setValue('.chat-input', 'Hello, this is Toan Nguyen')
      .submitForm('form.chat-form')
      .assert.elementPresent('.chat-line--me')
      .pause(3000)
      .end();
  }
};