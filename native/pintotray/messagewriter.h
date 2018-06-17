#ifndef MESSAGEWRITER_H
#define MESSAGEWRITER_H

#include <QDataStream>
#include <QFile>
#include <QJsonObject>
#include <QObject>

/**
 * Output for messages to the extension.
 */
class MessageWriter : public QObject {
    Q_OBJECT
public:
    /**
     * @param file The file to write to (typically this is stdout).
     */
    MessageWriter(FILE* file, QObject* parent = nullptr);

    /**
     * Write the application header, containing the version and notifying the receiver that the application has started.
     */
    void writeHeader();

    /**
     * Write a command.
     *
     * @param command The name of the command to send.
     * @param parameters The parameters to the command to send.
     */
    void write(const QString& command, const QJsonObject& parameters = QJsonObject());

    /**
     * Write a message.
     * This typically includes a command and its parameters.
     *
     * @param message The message to send.
     */
    void write(const QJsonObject& message);

private:
    QFile file;
    QDataStream stream;
};

#endif // MESSAGEWRITER_H
