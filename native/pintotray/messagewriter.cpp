#include "messagewriter.h"

#include <QJsonDocument>
#include <QJsonObject>

MessageWriter::MessageWriter(FILE* file, QObject* parent)
    : QObject(parent) {
    this->file.open(file, QFile::WriteOnly);
    stream.setDevice(&this->file);
    stream.setByteOrder(QDataStream::ByteOrder::LittleEndian);
}

void MessageWriter::writeHeader() {
    QJsonObject header;
    header["application"] = "PinToTray";
    header["version"] = "1.0";
    write(header);
}

void MessageWriter::write(const QString& command, const QJsonObject& parameters) {
    QJsonObject message(parameters);
    message["command"] = command;
    write(message);
}

void MessageWriter::write(const QJsonObject& message) {
    QByteArray messageBytes = QJsonDocument(message).toJson(QJsonDocument::JsonFormat::Compact);
    stream << messageBytes;
    file.flush();
}
