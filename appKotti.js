/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var teamsKB = {
    knowledgeBaseId: "4d5edd0f-13c6-4af9-ab9c-d5167858a492",
    authKey: "d219649a-bd62-44b6-9baf-3df5c9024da9",
    endpointHostName: "https://festinoqna.azurewebsites.net/qnamaker"
};
var sharePointKB = {
    knowledgeBaseId: "e612834d-f8a4-498a-80d0-373f48f60264",
    authKey: "d219649a-bd62-44b6-9baf-3df5c9024da9",
    endpointHostName: "https://festinoqna.azurewebsites.net/qnamaker"
};

var restify = require('restify');
var builder = require('botbuilder');
var builder_cognitiveservices = require("botbuilder-cognitiveservices");

var server = restify.createServer();
server.listen(3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

var previewRecognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: "4d5edd0f-13c6-4af9-ab9c-d5167858a492",
    authKey: "d219649a-bd62-44b6-9baf-3df5c9024da9"
});

var basicQnAMakerPreviewDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [previewRecognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3
});

bot.dialog('basicQnAMakerPreviewDialog', basicQnAMakerPreviewDialog);

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: "4d5edd0f-13c6-4af9-ab9c-d5167858a492",
    authKey: "d219649a-bd62-44b6-9baf-3df5c9024da9",
    endpointHostName: "https://festinoqna.azurewebsites.net/qnamaker"
});

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3
});

bot.dialog('basicQnAMakerDialog', basicQnAMakerDialog);

bot.dialog('/',
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
    ]);
