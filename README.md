# navy-admiral-slack-notifier

Send notifications to [Slack](https://slack.com/) after an Order is successfully executed.

## Installation

Run the following on the same server that the [Admrial](https://github.com/microadam/navy-admiral) is installed on:

    npm install -g navy-admiral-slack-notifier

## Usage

This plugin assumes that a `slackNotifer` hash containing the following options has been added to the [Admiral](http://github.com/microadam/navy-admiral) for the application you want notifications to be posted for.

* slackToken: Slack integration Token (required)
* slackOrg: Name of your Slack Organisation (required)
* channel: Slack channel to which notification should be posted (required)
* botName: The username that notification messages should be posted as (optional. Default is "admiralbot")
* orders: An array of Order names. If specified, notifications will only be posted for these Orders (optional. Default is all Orders)

An example [Admiral](http://github.com/microadam/navy-admiral) application configuration might look like:

    { "name": "My Application"
    , "appId": "myApp"
    , "slackNotifier":
      { "slackToken": "asasasdfasdf"
      , "slackOrg": "myOrg"
      , "channel": "general"
      , "botName": "mybot"
      , "orders": [ "orderName" ]
      }
    }
