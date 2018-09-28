var restify = require('restify');
var builder = require('botbuilder');
var builder_cognitiveservices = require("botbuilder-cognitiveservices");

var firstDialog = true;

var knowledgeBaseIDs = {
    sharePoint: "e612834d-f8a4-498a-80d0-373f48f60264",
    teams: "4d5edd0f-13c6-4af9-ab9c-d5167858a492"
};

var server = restify.createServer();
server.listen(3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

var bot = new builder.UniversalBot(connector);

var qnaMakerTools = new builder_cognitiveservices.QnAMakerTools();
bot.library(qnaMakerTools.createLibrary());

server.post('/api/messages', connector.listen());

/*bot.on("conversationUpdate", (message) =>
{
    if (message.membersAdded[0].id === message.address.bot.id) {
        var reply = new builder.Message()
            .address(message.address)
            .text("Hi, my name is Festino! How can i help you?");
        bot.send(reply);
    }
});*/

var luisAppId = "5dbd3446-a86c-4819-b48b-d5f17e91b87e";
var luisAPIKey = "6a71133fa1964f1b90fed95d8a7aa0e6";
var luisAPIHostName = 'westeurope.api.cognitive.microsoft.com';

var luisURL = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

var luisRecognizer = new builder.LuisRecognizer(luisURL);

var teamsRecognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: knowledgeBaseIDs.teams,
    authKey: "d219649a-bd62-44b6-9baf-3df5c9024da9",
    endpointHostName: "https://festinoqna.azurewebsites.net/qnamaker",
    top: 3
});

var teamsBasicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [teamsRecognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.7,
    feedbackLib: qnaMakerTools
});

var sharePointRecognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: knowledgeBaseIDs.sharePoint,
    authKey: "d219649a-bd62-44b6-9baf-3df5c9024da9",
    endpointHostName: "https://festinoqna.azurewebsites.net/qnamaker",
    top: 3
});

var sharePointBasicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [sharePointRecognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.7,
    feedbackLib: qnaMakerTools
});

/*bot.dialog('sharePointBasicQnAMakerDialog', sharePointBasicQnAMakerDialog);
bot.dialog('teamsBasicQnAMakerDialog', teamsBasicQnAMakerDialog);*/

/*
bot.dialog("/", [(session) =>
{
    if(firstDialog)
    {
        session.send("Hi, my name is Festino!");
    }
    builder.Prompts.choice(session, firstDialog ? "Which platform do you need help for?" :
        "Can I help you with you with something else?", "SharePoint|Teams",
        {listStyle: builder.ListStyle.button});
}, (session, result) =>
{
    session.beginDialog("CategorySelection", {category:result.response.entity});
}]);
*/

var intents = new builder.IntentDialog({recognizers: [luisRecognizer, teamsRecognizer, sharePointRecognizer]});

bot.dialog("/", intents);

intents.matches("Goodbye", builder.DialogAction.send("LUIS Goodbye Intent"));

intents.onDefault([(session) =>
{
    session.send("Sorry! No match!");
}]);

/*
bot.dialog("CategorySelection", [(session, args) =>
{
    firstDialog = false;

    if(args.category === "SharePoint")
    {
        session.beginDialog("SharePointMain");
    }
    else if(args.category === "Teams")
    {
        session.beginDialog("TeamsMain");
    }
}, (session, result) =>
{
    session.replaceDialog("CategorySelection", {category: result.category});
}]);

bot.dialog("SharePointMain", [(session) =>
{
    builder.Prompts.text(session, "What do you want to know about SharePoint?");
}, (session, results) =>
{
    session.beginDialog('sharePointBasicQnAMakerDialog');
}, (session, result) =>
{
    session.endDialogWithResult({category: "SharePoint"})
}]);

bot.dialog("TeamsMain", [(session) =>
{
    builder.Prompts.text(session, "What do you want to know about Teams?");
}, (session, results) =>
{
    session.beginDialog('teamsBasicQnAMakerDialog');
}, (session, result) =>
{
    session.endDialogWithResult({category: "Teams"})
}]);





bot.dialog("Cancel", [(session) =>
{
    session.send("You now leave this context");
    session.replaceDialog("/");
}])
.triggerAction({
    matches: /^cancel$/i
});

bot.dialog("Help", [(session) =>
{
    session.send("This is the help dialog");
}])
.triggerAction({
    matches: /^help$/i
});*/
