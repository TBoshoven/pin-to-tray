#include "commandhandler.h"

#include "messagereader.h"

#include <QtDebug>

CommandHandler::CommandHandler(MessageReader& messageReader, CommandGenerator& commandGenerator, QObject* parent)
    : QObject(parent)
    , commandGenerator(commandGenerator) {
    connect(&messageReader, SIGNAL(messageRead(QString, QJsonObject)), this,
            SLOT(handle(const QString&, const QJsonObject&)));
}

void CommandHandler::registerCommand(const QSharedPointer<Command>& command) {
    commands[command->name()] = command;
}

void CommandHandler::handle(const QString& command, const QJsonObject& parameters) {
    auto commandPtr = commands[command];
    if (commandPtr == nullptr) {
        qWarning() << "Unknown command";
        return;
    }
    (*commandPtr)(parameters, commandGenerator);
}
