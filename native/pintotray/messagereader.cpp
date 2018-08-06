#include "messagereader.h"

#include <QDataStream>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>
#include <QtDebug>

MessageReader::MessageReader(QObject* parent)
    : QThread(parent) {}

void MessageReader::run() {
    QFile inputFile;
    QDataStream stream(&inputFile);
    stream.setByteOrder(QDataStream::ByteOrder::LittleEndian);
    inputFile.open(stdin, QFile::ReadOnly);

    int32_t size;
    while (stream.status() == QDataStream::Ok) {
        stream >> size;
        if (size > (1 << 20)) {
            qWarning() << "Message size" << size << "is greater than the maximum";
            return;
        }

        qDebug() << "Receiving message of size" << size;

        char bytes[size];
        for (int read = 0; read < size && stream.status() == QDataStream::Ok;
             read += stream.readRawData(bytes + read, size - read))
            ;
        if (stream.status() != QDataStream::Ok) {
            break;
        }
        qDebug() << "Read" << size << "bytes";

        QJsonParseError parseError;
        QJsonDocument jsonDocument(QJsonDocument::fromJson(QByteArray(bytes, size), &parseError));
        if (jsonDocument.isNull()) {
            qWarning() << "Command parsing error:" << parseError.errorString();
            return;
        }

        QJsonValue commandValue = jsonDocument.object().value("command");
        if (commandValue.isUndefined()) {
            qWarning() << "Missing command";
            return;
        }

        if (!commandValue.isString()) {
            qWarning() << "Command is not a string";
            return;
        }

        QString command(commandValue.toString());

        QJsonObject parameters(jsonDocument.object());
        parameters.remove("command");

        qDebug() << "Received command: " << command << "("
                 << QJsonDocument(parameters).toJson(QJsonDocument::JsonFormat::Compact) << ")";

        emit messageRead(command, parameters);
    }
}
