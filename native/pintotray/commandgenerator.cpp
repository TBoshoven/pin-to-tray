#include "commandgenerator.h"

#include "messagewriter.h"

CommandGenerator::CommandGenerator(MessageWriter& messageWriter, QObject* parent)
    : QObject(parent)
    , messageWriter(messageWriter) {}

void CommandGenerator::iconActivated(int id, QSystemTrayIcon::ActivationReason reason) {
    QJsonObject parameters;
    parameters["id"] = id;
    if (reason == QSystemTrayIcon::ActivationReason::Trigger || reason == QSystemTrayIcon::ActivationReason::Unknown) {
        messageWriter.write("HandleClick", parameters);
    }
}

void CommandGenerator::unpinRequested(int id) {
    QJsonObject parameters;
    parameters["id"] = id;
    messageWriter.write("Unpin", parameters);
}

void CommandGenerator::trayIsEmpty() {
    messageWriter.write("TrayIsEmpty");
}
