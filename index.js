var request = require('request')

module.exports = function createSlackNotifier(options) {

  var serviceLocator = options.serviceLocator

  function slackNotifier() {

    serviceLocator.messageBus.on('orderComplete', function (requestData, appData) {
      var options = appData.slackNotifier
      if (!options || !options.slackToken || !options.slackOrg || !options.channel) {
        serviceLocator.logger.warn('Slack notifier not configured for ' + appData.name)
        serviceLocator.logger.warn('Not sending slack notification')
        return false
      }
      var orders = options.orders || []
      if (!orders.length) {
        orders.push(requestData.order)
      }
      if (orders.indexOf(requestData.order) > -1) {
        sendNotification(options, requestData, appData)
      }
    })

  }

  function sendNotification(options, requestData, appData) {
    var envString = requestData.environment.charAt(0).toUpperCase() + requestData.environment.slice(1)
      , orderString = requestData.order.charAt(0).toUpperCase() + requestData.order.slice(1)
      , argString = requestData.orderArgs.join(', ')
      , message = appData.name + ' ' + envString + ' "' + orderString + '" ' +
          argString + ' has been successfully executed'
      , imgUrl = 'http://upload.wikimedia.org/wikipedia/commons/3/34/Steering_wheel_ship_1.png'
      , data =
          { channel: '#' + options.channel
          , username: options.botName ? options.botName : 'admiralbot'
          , 'icon_url': imgUrl
          , text: 'Order Executed'
          , attachments:
            [ { color: '#DEDEDE'
              , fallback: message
              , fields:
                [ { title: 'Application'
                  , value: appData.name + ' ' + envString
                  , short: false
                  }
                , { title: 'Order'
                  , value: orderString
                  , short: true
                  }
                , { title: 'Order Arguments'
                  , value: argString
                  , short: true
                  }
                ]
              }
            ]
          }
      , url = 'https://' + options.slackOrg + '.slack.com/services/hooks/incoming-webhook?token=' + options.slackToken

    request.post(
      { url: url
      , json: true
      , body: data
      }
    , function(error) {
        if (error) {
          serviceLocator.logger.error('Error occurred while sending slack notification: ' + error.message)
        }
      }
    )
  }

  return slackNotifier
}
