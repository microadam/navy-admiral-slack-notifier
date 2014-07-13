var assert = require('assert')
  , sinon = require('sinon')
  , EventEmitter = require('events').EventEmitter
  , rewire = require('rewire')
  , createSlackNotifier = rewire('../')

describe('navy-admiral-slack-notifier', function () {

  it('should error when required options are not present', function (done) {
    var warnSpy = sinon.spy()
      , requestPostSpy = sinon.spy()
      , messageBus = new EventEmitter()
      , serviceLocator =
          { messageBus: messageBus
          , logger: { warn: warnSpy }
          }
      , slackNotifier = createSlackNotifier({ serviceLocator: serviceLocator })

    createSlackNotifier.__set__('request', { post: requestPostSpy })

    slackNotifier()
    messageBus.emit('orderComplete', {}, {})
    process.nextTick(function () {
      assert.equal(warnSpy.calledTwice, true, 'warn should have been called twice. Called: ' + warnSpy.callCount)
      var callCount = requestPostSpy.callCount
      assert.equal(callCount, 0, 'request post should not have been called. Called: ' + callCount)
      done()
    })
  })

  it('should send correct data to correct URL with default options', function (done) {
    var messageBus = new EventEmitter()
      , serviceLocator =
          { messageBus: messageBus
          }
      , slackNotifier = createSlackNotifier({ serviceLocator: serviceLocator })
      , requestOptions =
          { environment: 'production'
          , order: 'order'
          , orderArgs: [ 'argOne', 'argTwo' ]
          }
      , slackOptions =
          { slackToken: 'abc123'
          , slackOrg: 'org'
          , channel: 'test'
          }

    function requestPost(data, callback) {
      assert.equal(data.json, true)
      assert.equal(data.url, 'https://org.slack.com/services/hooks/incoming-webhook?token=abc123')
      assert(data.body, 'request body should exist')
      assert.equal(data.body.channel, '#test')
      assert.equal(data.body.username, 'admiralbot')
      var imgUrl = 'http://upload.wikimedia.org/wikipedia/commons/3/34/Steering_wheel_ship_1.png'
      assert.equal(data.body['icon_url'], imgUrl)
      assert.equal(data.body.text, 'Order Executed')
      assert.equal(data.body.attachments.length, 1)
      assert.equal(data.body.attachments[0].color, '#DEDEDE')
      var fallbackMessage = 'Test App Production "Order" argOne, argTwo has been successfully executed'
      assert.equal(data.body.attachments[0].fallback, fallbackMessage)
      assert.equal(data.body.attachments[0].fields.length, 3)
      assert.equal(data.body.attachments[0].fields[0].title, 'Application')
      assert.equal(data.body.attachments[0].fields[0].value, 'Test App Production')
      assert.equal(data.body.attachments[0].fields[0].short, false)
      assert.equal(data.body.attachments[0].fields[1].title, 'Order')
      assert.equal(data.body.attachments[0].fields[1].value, 'Order')
      assert.equal(data.body.attachments[0].fields[1].short, true)
      assert.equal(data.body.attachments[0].fields[2].title, 'Order Arguments')
      assert.equal(data.body.attachments[0].fields[2].value, 'argOne, argTwo')
      assert.equal(data.body.attachments[0].fields[2].short, true)
      callback()
      done()
    }

    createSlackNotifier.__set__('request', { post: requestPost })

    slackNotifier()
    messageBus.emit('orderComplete', requestOptions, { name: 'Test App', slackNotifier: slackOptions })
  })

  it('should send correct data to correct URL with custom botName', function (done) {
    var messageBus = new EventEmitter()
      , serviceLocator =
          { messageBus: messageBus
          }
      , slackNotifier = createSlackNotifier({ serviceLocator: serviceLocator })
      , requestOptions =
          { environment: 'production'
          , order: 'order'
          , orderArgs: [ 'argOne', 'argTwo' ]
          }
      , slackOptions =
          { slackToken: 'abc123'
          , slackOrg: 'org'
          , channel: 'test'
          , botName: 'myBotName'
          }

    function requestPost(data, callback) {
      assert.equal(data.body.username, 'myBotName')
      callback()
      done()
    }

    createSlackNotifier.__set__('request', { post: requestPost })

    slackNotifier()
    messageBus.emit('orderComplete', requestOptions, { name: 'Test App', slackNotifier: slackOptions })
  })

  it('should not send a notification when order is not in specified orders', function (done) {
    var warnSpy = sinon.spy()
      , requestPostSpy = sinon.spy()
      , messageBus = new EventEmitter()
      , serviceLocator =
          { messageBus: messageBus
          , logger: { warn: warnSpy }
          }
      , slackNotifier = createSlackNotifier({ serviceLocator: serviceLocator })
      , slackOptions =
          { slackToken: 'abc123'
          , slackOrg: 'org'
          , channel: 'test'
          , orders: [ 'myOrder' ]
          }

    createSlackNotifier.__set__('request', { post: requestPostSpy })

    slackNotifier()
    messageBus.emit('orderComplete', { order: 'doNotNotify' }, { name: 'Test App', slackNotifier: slackOptions })
    process.nextTick(function () {
      assert.equal(warnSpy.callCount, 0, 'warn should not have been called. Called: ' + warnSpy.callCount)
      var callCount = requestPostSpy.callCount
      assert.equal(callCount, 0, 'request post should not have been called. Called: ' + callCount)
      done()
    })
  })

  it('should send a notification when order is in specified orders', function (done) {
    var warnSpy = sinon.spy()
      , requestPostSpy = sinon.spy()
      , messageBus = new EventEmitter()
      , serviceLocator =
          { messageBus: messageBus
          , logger: { warn: warnSpy }
          }
      , slackNotifier = createSlackNotifier({ serviceLocator: serviceLocator })
      , requestOptions =
          { environment: 'production'
          , order: 'myOrder'
          , orderArgs: [ 'argOne', 'argTwo' ]
          }
      , slackOptions =
          { slackToken: 'abc123'
          , slackOrg: 'org'
          , channel: 'test'
          , orders: [ 'myOrder' ]
          }

    createSlackNotifier.__set__('request', { post: requestPostSpy })

    slackNotifier()
    messageBus.emit('orderComplete', requestOptions, { name: 'Test App', slackNotifier: slackOptions })
    process.nextTick(function () {
      assert.equal(warnSpy.callCount, 0, 'warn should not have been called. Called: ' + warnSpy.callCount)
      var callCount = requestPostSpy.callCount
      assert.equal(callCount, 1, 'request post should have been called once. Called: ' + callCount)
      done()
    })
  })

  it('should log errors from request', function (done) {
    var errorSpy = sinon.spy()
      , messageBus = new EventEmitter()
      , serviceLocator =
          { messageBus: messageBus
          , logger: { error: errorSpy }
          }
      , slackNotifier = createSlackNotifier({ serviceLocator: serviceLocator })
      , requestOptions =
          { environment: 'production'
          , order: 'order'
          , orderArgs: [ 'argOne', 'argTwo' ]
          }
      , slackOptions =
          { slackToken: 'abc123'
          , slackOrg: 'org'
          , channel: 'test'
          , botName: 'myBotName'
          }

    function requestPost(data, callback) {
      assert.equal(data.body.username, 'myBotName')
      callback(new Error('Request Error'))
      process.nextTick(function () {
        assert.equal(errorSpy.callCount, 1, 'error should have been called once. Called: ' + errorSpy.callCount)
        done()
      })
    }

    createSlackNotifier.__set__('request', { post: requestPost })

    slackNotifier()
    messageBus.emit('orderComplete', requestOptions, { name: 'Test App', slackNotifier: slackOptions })
  })

})
