var restify = require('restify');
var builder = require('botbuilder');
var builder_cognitiveservices = require("botbuilder-cognitiveservices");

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

bot.on("conversationUpdate", (message) =>
{
    if (message.membersAdded[0].id === message.address.bot.id) {
        var reply = new builder.Message()
            .address(message.address)
            .text("Hi, my name is Festino! How can i help you?");
        bot.send(reply);
    }
});

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

bot.dialog('sharePointBasicQnAMakerDialog', sharePointBasicQnAMakerDialog);
bot.dialog('teamsBasicQnAMakerDialog', teamsBasicQnAMakerDialog);

bot.dialog("/", [(session) =>
{
    builder.Prompts.choice(session, "Mit welcher Plattform kann ich dir helfen?", ["SharePoint", "Teams"]);
}, (session, results) =>
{
    if(results.response.entity === "SharePoint")
    {
        session.beginDialog("SharePointMain");
    }
    else if(results.response.entity === "Teams")
    {
        session.beginDialog("TeamsMain");
    }
}]);

bot.dialog("SharePointMain", [(session) =>
{
    builder.Prompts.text(session, "What do you want to know about SharePoint?");
}, (session, results) =>
{
    session.replaceDialog('sharePointBasicQnAMakerDialog');
}]);

bot.dialog("TeamsMain", [(session) =>
{
    builder.Prompts.text(session, "What do you want to know about Teams?");
}, (session, results) =>
{
    session.replaceDialog('teamsBasicQnAMakerDialog');
}]);



/*var basicQnAMakerPreviewDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [previewRecognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3
});*/

//bot.dialog('basicQnAMakerPreviewDialog', basicQnAMakerPreviewDialog);

//bot.dialog('basicQnAMakerDialog', basicQnAMakerDialog);

/*bot.dialog('/',
    [
        function (session) {
            var qnaKnowledgebaseId = "4d5edd0f-13c6-4af9-ab9c-d5167858a492";
            var qnaAuthKey = "d219649a-bd62-44b6-9baf-3df5c9024da9";
            var endpointHostName = "https://festinoqna.azurewebsites.net/qnamaker";

            if ((qnaAuthKey == null || qnaAuthKey === '') || (qnaKnowledgebaseId == null || qnaKnowledgebaseId === ''))
                session.send('Please set QnAKnowledgebaseId, QnAAuthKey and QnAEndpointHostName (if applicable) in App Settings. Learn how to get them at https://aka.ms/qnaabssetup.');
            else {
                if (endpointHostName == null || endpointHostName === '')
                    session.replaceDialog('basicQnAMakerPreviewDialog');
                else
                    session.replaceDialog('basicQnAMakerDialog');
            }
        }
    ]);*/
